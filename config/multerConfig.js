// File: config/multerConfig.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('node:fs/promises');
const { createFileFilter } = require('../middleware/multer-error-handler');

// Constantes para tipos de documentos
const TIPOS_DOCUMENTOS = {
  INE: 'ine',
  CURP: 'curp',
  RFC: 'rfc',
  ACTA_NACIMIENTO: 'actas_nacimiento',
  CERTIFICADO_ESTUDIOS: 'certificados_estudios',
  CERTIFICADO_CURSO: 'certificados_cursos',
  APROBACION_PERMISO: 'aprobaciones_permisos',
  RESPALDO_CAMBIO_ADSCRIPCION: 'documentos_respaldo_cambios_adscripcion',
  OTRO: 'otros_documentos'
};

// Mapeo de nombres descriptivos a claves del sistema
const MAPEO_TIPOS_DOCUMENTOS = {
  'INE': TIPOS_DOCUMENTOS.INE,
  'CURP': TIPOS_DOCUMENTOS.CURP,
  'RFC': TIPOS_DOCUMENTOS.RFC,
  'Acta de Nacimiento': TIPOS_DOCUMENTOS.ACTA_NACIMIENTO,
  'Certificado de Estudios': TIPOS_DOCUMENTOS.CERTIFICADO_ESTUDIOS,
  'Certificado de Curso': TIPOS_DOCUMENTOS.CERTIFICADO_CURSO,
  'Aprobación Permiso': TIPOS_DOCUMENTOS.APROBACION_PERMISO,
  'Respaldo Cambio Adscripción': TIPOS_DOCUMENTOS.RESPALDO_CAMBIO_ADSCRIPCION,
  'Otro': TIPOS_DOCUMENTOS.OTRO
};

// Lista de MIME types permitidos
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
];

// Creación del filtro de archivos
const fileFilter = createFileFilter(
  ALLOWED_MIME_TYPES,
  'Tipo de archivo no permitido. Formatos aceptados: PDF, JPEG, PNG, WEBP, DOC, DOCX, XLS, XLSX'
);

const storageDocumentos = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Validar que existe tipo_documento en req.body
    if (!req.body.tipo_documento) {
      const error = new Error('Tipo de documento no especificado');
      error.code = 'MULTER_CUSTOM_ERROR';
      error.name = 'MulterCustomError';
      return cb(error);
    }

    // Determinar el directorio según el tipo de documento
    const tipoDocumentoKey = MAPEO_TIPOS_DOCUMENTOS[req.body.tipo_documento] || TIPOS_DOCUMENTOS.OTRO;
    const uploadDir = path.join(__dirname, '../uploads', tipoDocumentoKey);

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error al crear el directorio de carga:', error);
      error.code = 'STORAGE_ERROR';
      error.name = 'MulterCustomError';
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre de archivo seguro y único
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(/\.[^/.]+$/, "") // Elimina la extensión
      .replace(/[^\w\s-]/g, '') // Elimina caracteres especiales
      .replace(/\s+/g, '-') // Reemplaza espacios por guiones
      .substring(0, 40); // Limita la longitud
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${fileExtension}`);
  },
});

// Configuración final de multer
const uploadDocumento = multer({
  storage: storageDocumentos,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  }
});



// Exportar constantes y configuración para uso en otros módulos
module.exports = { 
  uploadDocumento,
  TIPOS_DOCUMENTOS,
  MAPEO_TIPOS_DOCUMENTOS,
  ALLOWED_MIME_TYPES
};