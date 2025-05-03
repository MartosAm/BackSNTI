// file: controllers/documentocontroller.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const { MAPEO_TIPOS_DOCUMENTOS } = require('../config/multerConfig');
const prisma = new PrismaClient();

/**
 * Controlador para subir un documento al sistema
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con resultado de la operación
 */
const subirDocumento = async (req, res) => {
    try {
        // Verificar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se proporcionó ningún archivo.' 
            });
        }

        const { id_trabajador, tipo_documento, descripcion } = req.body;
        const es_publico = req.body.es_publico === 'true' || req.body.es_publico === true;
        
        const { filename, path: rutaTemporal, originalname, mimetype, size } = req.file;

        try {
            // Calcula el hash del archivo para verificar duplicados y garantizar integridad
            const fileBuffer = await fs.readFile(rutaTemporal);
            const hashArchivo = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            
            // Determina ruta de almacenamiento usando el mapeo de tipos
            const tipoDocumentoKey = MAPEO_TIPOS_DOCUMENTOS[tipo_documento] || MAPEO_TIPOS_DOCUMENTOS['Otro'];
            const rutaAlmacenamiento = path.join(tipoDocumentoKey, filename);
            
            // Extrae el tipo de archivo desde el MIME
            const tipoArchivo = mimetype.split('/')[1];
            
            // Metadata básica del archivo
            const metadata = JSON.stringify({
                mime_type: mimetype,
                original_name: originalname,
                upload_date: new Date().toISOString(),
                file_size_bytes: size
            });

            try {
                // Llamar a la función de PostgreSQL correctamente con Prisma
                await prisma.$executeRaw`
    SELECT public.sp_subir_documento(
        ${parseInt(id_trabajador)}::INTEGER, 
        ${tipo_documento}::VARCHAR, 
        ${metadata}::JSONB, 
        ${hashArchivo}::VARCHAR, 
        ${originalname}::VARCHAR, 
        ${descripcion || null}::TEXT, 
        ${tipoArchivo}::VARCHAR, 
        ${rutaAlmacenamiento}::TEXT, 
        ${size}::BIGINT, 
        ${es_publico}::BOOLEAN
    );
`;

            } catch (dbError) {
                console.error('Error al llamar la función de PostgreSQL:', dbError);
                // Asegurarse de que eliminamos el archivo temporal
                await fs.unlink(rutaTemporal).catch(e => console.error('Error eliminando archivo temporal:', e));
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al registrar el documento en la base de datos', 
                    error: dbError.message 
                });
            }

            // Verificar que el documento se guardó correctamente
            const documentoSubido = await prisma.documentos.findFirst({
                where: { 
                    hash_archivo: hashArchivo, 
                    id_trabajador: parseInt(id_trabajador)
                },
                select: {
                    id_documento: true,
                    nombre_archivo: true,
                    ruta_almacenamiento: true,
                    tipo_documento: true,
                    fecha_subida: true
                }
            });

            if (!documentoSubido) {
                // Si no encontramos el documento, puede que la función haya fallado silenciosamente
                await fs.unlink(rutaTemporal).catch(e => console.error('Error eliminando archivo temporal:', e));
                return res.status(500).json({
                    success: false,
                    message: 'El documento se procesó pero no se encontró en la base de datos'
                });
            }

            // Eliminar el archivo temporal después de procesarlo
            await fs.unlink(rutaTemporal).catch(e => {
                console.error('Error al eliminar archivo temporal:', e);
                // No interrumpimos el flujo por un error al eliminar el temporal
            });

            // Responder al cliente indicando éxito
            return res.status(201).json({
                success: true,
                message: 'Documento subido exitosamente',
                data: documentoSubido
            });
            
        } catch (processError) {
            console.error('Error al procesar el archivo:', processError);
            // Intenta eliminar el archivo temporal si hubo error procesándolo
            await fs.unlink(rutaTemporal).catch(e => console.error('Error eliminando archivo temporal:', e));
            return res.status(500).json({ 
                success: false, 
                message: 'Error al procesar el archivo', 
                error: processError.message 
            });
        }
    } catch (error) {
        console.error('Error general al subir el documento:', error);
        
        // Intentar eliminar el archivo temporal si existe y hubo un error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo temporal:', unlinkError);
            }
        }

        // Asegurarse de enviar respuesta al cliente incluso en caso de error
        return res.status(500).json({ 
            success: false, 
            message: 'Error al guardar el documento', 
            error: error.message 
        });
    }
};

/**
 * Obtiene los documentos asociados a un trabajador
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con los documentos del trabajador
 */
const obtenerDocumentosPorTrabajador = async (req, res) => {
    try {
        const { id_trabajador } = req.params;

        // Verificar que el trabajador existe
        const trabajador = await prisma.trabajadores.findUnique({
            where: { id_trabajador: parseInt(id_trabajador) }
        });

        if (!trabajador) {
            return res.status(404).json({
                success: false,
                message: 'Trabajador no encontrado'
            });
        }

        // Obtener documentos asociados al trabajador
        const documentos = await prisma.documentos.findMany({
            where: { 
                id_trabajador: parseInt(id_trabajador),
                activo: true
            },
            select: {
                id_documento: true,
                tipo_documento: true,
                nombre_archivo: true,
                descripcion: true,
                fecha_subida: true,
                es_publico: true,
                ruta_almacenamiento: true
            },
            orderBy: {
                fecha_subida: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            data: documentos
        });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al recuperar documentos',
            error: error.message
        });
    }
};

module.exports = {
    subirDocumento,
    obtenerDocumentosPorTrabajador
};