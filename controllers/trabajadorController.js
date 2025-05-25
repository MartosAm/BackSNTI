//file: controllers/trabajadorController.js
// Este archivo contiene la lógica para manejar las operaciones CRUD de los trabajadores

const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const validarTrabajador = [
  // Campos de autenticación
  body('identificador').notEmpty().withMessage('El identificador es obligatorio')
    .isLength({ max: 150 }).withMessage('El identificador no puede exceder 150 caracteres'),
  body('contraseña').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').optional().isIn(['ADMINISTRADOR','USUARIO']).withMessage('Rol no válido'),
  
  // Datos personales/laborales (mantienen las validaciones originales)
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('apellido_paterno').notEmpty().withMessage('El apellido paterno es obligatorio').isLength({ max: 100 }),
  body('apellido_materno').optional().isLength({ max: 100 }),
  body('fecha_nacimiento').notEmpty().withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('sexo').notEmpty().withMessage('El sexo es obligatorio')
    .isIn(['M', 'F']).withMessage('Valor de sexo no válido'),
  body('curp').notEmpty().withMessage('El CURP es obligatorio')
    .isLength({ min: 18, max: 18 }).withMessage('El CURP debe tener 18 caracteres')
    .matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/).withMessage('Formato de CURP inválido'),
  body('rfc').notEmpty().withMessage('El RFC es obligatorio')
    .isLength({ min: 13, max: 13 }).withMessage('El RFC debe tener 13 caracteres')
    .matches(/^[A-Z]{4}\d{6}[0-9A-Z]{3}$/).withMessage('Formato de RFC inválido'),
  body('email').notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Formato de email inválido').isLength({ max: 150 }),
  body('situacion_sentimental').optional()
    .isIn(['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Union Libre']).withMessage('Valor de situación sentimental no válido'),
  body('numero_hijos').optional().isInt({ min: 0 }).withMessage('Número de hijos inválido'),
  body('numero_empleado').notEmpty().withMessage('El número de empleado es obligatorio')
    .isLength({ min: 10, max: 10 }).withMessage('El número de empleado debe tener 10 caracteres'),
  body('numero_plaza').notEmpty().withMessage('El número de plaza es obligatorio')
    .isLength({ min: 8, max: 8 }).withMessage('El número de plaza debe tener 8 caracteres'),
  body('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('fecha_ingreso_gobierno').notEmpty().withMessage('La fecha de ingreso al gobierno es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('nivel_puesto').notEmpty().withMessage('El nivel de puesto es obligatorio').isLength({ max: 50 }),
  body('nombre_puesto').notEmpty().withMessage('El nombre del puesto es obligatorio').isLength({ max: 100 }),
  body('puesto_inpi').optional().isLength({ max: 100 }),
  body('adscripcion').notEmpty().withMessage('La adscripción es obligatoria').isLength({ max: 100 }),
  body('id_seccion').notEmpty().withMessage('La sección es obligatoria').isInt().withMessage('ID de sección inválido'),
  body('nivel_estudios').optional().isLength({ max: 100 }),
  body('institucion_estudios').optional().isLength({ max: 200 }),
  body('certificado_estudios').optional().isBoolean().withMessage('Valor de certificado inválido'),
  body('plaza_base').optional().isLength({ max: 10 })
];

const crearTrabajador = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Error de validación', errors: errors.array() });
    }

    const {
      identificador, contraseña, rol,
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, rfc,
      email, situacion_sentimental, numero_hijos, numero_empleado, numero_plaza,
      fecha_ingreso, fecha_ingreso_gobierno, nivel_puesto, nombre_puesto, puesto_inpi,
      adscripcion, id_seccion, nivel_estudios, institucion_estudios, certificado_estudios,
      plaza_base
    } = req.body;

    // Convertir fechas
    const fechaNacimientoDate = new Date(fecha_nacimiento);
    const fechaIngresoDate = new Date(fecha_ingreso);
    const fechaIngresoGobiernoDate = new Date(fecha_ingreso_gobierno);

    // Verificar duplicados
    const existente = await prisma.trabajadores.findFirst({
      where: {
        OR: [
          { identificador },
          { curp },
          { rfc },
          { email },
          { numero_empleado },
          { numero_plaza }
        ]
      }
    });

    if (existente) {
      let camposDuplicados = [];
      if (existente.identificador === identificador) camposDuplicados.push('Identificador');
      if (existente.curp === curp) camposDuplicados.push('CURP');
      if (existente.rfc === rfc) camposDuplicados.push('RFC');
      if (existente.email === email) camposDuplicados.push('Email');
      if (existente.numero_empleado === numero_empleado) camposDuplicados.push('Número de empleado');
      if (existente.numero_plaza === numero_plaza) camposDuplicados.push('Número de plaza');

      return res.status(409).json({
        success: false,
        message: `Ya existe un trabajador con los siguientes datos: ${camposDuplicados.join(', ')}`
      });
    }

    // Encriptar contraseña si se proporciona
    let contraseñaHash = null;
    if (contraseña) {
      const saltRounds = 12;
      contraseñaHash = await bcrypt.hash(contraseña, saltRounds);
    }

    const nuevoTrabajador = await prisma.trabajadores.create({
      data: {
        // Campos de autenticación
        identificador,
        contraseña_hash: contraseñaHash,
        intentos_fallidos: 0,
        bloqueado: false,
        rol: rol || 'USUARIO',
        // Datos personales/laborales
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento: fechaNacimientoDate,
        sexo,
        curp,
        rfc,
        email,
        situacion_sentimental,
        numero_hijos: numero_hijos || 0,
        numero_empleado,
        numero_plaza,
        fecha_ingreso: fechaIngresoDate,
        fecha_ingreso_gobierno: fechaIngresoGobiernoDate,
        nivel_puesto,
        nombre_puesto,
        puesto_inpi,
        adscripcion,
        id_seccion,
        nivel_estudios,
        institucion_estudios,
        certificado_estudios,
        plaza_base
      }
    });

    // Omitir contraseña_hash en la respuesta
    const { contraseña_hash, ...trabajadorSinPassword } = nuevoTrabajador;

    return res.status(201).json({ 
      success: true, 
      message: 'Trabajador creado exitosamente', 
      data: trabajadorSinPassword 
    });

  } catch (error) {
    console.error('Error al crear el trabajador:', error);
    return res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
  }
};

const eliminarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;

    const trabajadorId = parseInt(id);
    if (isNaN(trabajadorId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del trabajador debe ser un número válido'
      });
    }

    const trabajadorExistente = await prisma.trabajadores.findUnique({
      where: {
        id_trabajador: trabajadorId
      }
    });

    if (!trabajadorExistente) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }

    await prisma.trabajadores.delete({
      where: {
        id_trabajador: trabajadorId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Trabajador eliminado exitosamente'
    });

  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el trabajador porque está siendo utilizado en otras tablas'
      });
    }
    console.error('Error al eliminar el trabajador:', error);
    return res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
  }
};

/**
 * Obtener un trabajador por su ID
 * @param {object} req - Objeto de solicitud de Express
 * @param {object} res - Objeto de respuesta de Express
 */
const obtenerTrabajadorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const trabajadorId = parseInt(id);

    if (isNaN(trabajadorId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del trabajador debe ser un número válido'
      });
    }

    const trabajador = await prisma.trabajadores.findUnique({
      where: {
        id_trabajador: trabajadorId
      },
      include: {
        seccion: true,
        sanciones: true,
        trabajadores_cursos: true
      }
    });

    if (!trabajador) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }

    // Omitir contraseña_hash en la respuesta
    const { contraseña_hash, ...trabajadorSinPassword } = trabajador;

    return res.status(200).json({
      success: true,
      data: trabajadorSinPassword
    });

  } catch (error) {
    console.error('Error al obtener el trabajador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

const actualizarTrabajador = async (req, res) => {
  const { id } = req.params;
  const trabajadorId = parseInt(id);
  const datosActualizar = req.body;

  try {
    if (isNaN(trabajadorId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del trabajador debe ser un número válido'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    // Verifica si el trabajador existe
    const trabajadorExistente = await prisma.trabajadores.findUnique({
      where: { id_trabajador: trabajadorId }
    });

    if (!trabajadorExistente) {
      return res.status(404).json({
        success: false,
        message: `Trabajador con ID ${trabajadorId} no encontrado`
      });
    }

    // Preparar datos para actualización
    const datosParaActualizar = {};

    // Campos de autenticación
    if (datosActualizar.identificador !== undefined) {
      datosParaActualizar.identificador = datosActualizar.identificador;
    }
    
    if (datosActualizar.contraseña !== undefined && datosActualizar.contraseña !== '') {
      const saltRounds = 12;
      datosParaActualizar.contraseña_hash = await bcrypt.hash(datosActualizar.contraseña, saltRounds);
      datosParaActualizar.ultimo_cambio_password = new Date();
    }
    
    if (datosActualizar.rol !== undefined) {
      datosParaActualizar.rol = datosActualizar.rol;
    }

    if (datosActualizar.bloqueado !== undefined) {
      datosParaActualizar.bloqueado = datosActualizar.bloqueado;
      if (!datosActualizar.bloqueado) {
        datosParaActualizar.intentos_fallidos = 0;
      }
    }

    // Datos personales/laborales
    if (datosActualizar.nombre !== undefined) datosParaActualizar.nombre = datosActualizar.nombre;
    if (datosActualizar.apellido_paterno !== undefined) datosParaActualizar.apellido_paterno = datosActualizar.apellido_paterno;
    if (datosActualizar.apellido_materno !== undefined) datosParaActualizar.apellido_materno = datosActualizar.apellido_materno;
    if (datosActualizar.fecha_nacimiento !== undefined) datosParaActualizar.fecha_nacimiento = new Date(datosActualizar.fecha_nacimiento);
    if (datosActualizar.sexo !== undefined) datosParaActualizar.sexo = datosActualizar.sexo;
    if (datosActualizar.curp !== undefined) datosParaActualizar.curp = datosActualizar.curp;
    if (datosActualizar.rfc !== undefined) datosParaActualizar.rfc = datosActualizar.rfc;
    if (datosActualizar.email !== undefined) datosParaActualizar.email = datosActualizar.email;
    if (datosActualizar.situacion_sentimental !== undefined) datosParaActualizar.situacion_sentimental = datosActualizar.situacion_sentimental;
    if (datosActualizar.numero_hijos !== undefined) datosParaActualizar.numero_hijos = datosActualizar.numero_hijos;
    if (datosActualizar.numero_empleado !== undefined) datosParaActualizar.numero_empleado = datosActualizar.numero_empleado;
    if (datosActualizar.numero_plaza !== undefined) datosParaActualizar.numero_plaza = datosActualizar.numero_plaza;
    if (datosActualizar.fecha_ingreso !== undefined) datosParaActualizar.fecha_ingreso = new Date(datosActualizar.fecha_ingreso);
    if (datosActualizar.fecha_ingreso_gobierno !== undefined) datosParaActualizar.fecha_ingreso_gobierno = new Date(datosActualizar.fecha_ingreso_gobierno);
    if (datosActualizar.nivel_puesto !== undefined) datosParaActualizar.nivel_puesto = datosActualizar.nivel_puesto;
    if (datosActualizar.nombre_puesto !== undefined) datosParaActualizar.nombre_puesto = datosActualizar.nombre_puesto;
    if (datosActualizar.puesto_inpi !== undefined) datosParaActualizar.puesto_inpi = datosActualizar.puesto_inpi;
    if (datosActualizar.adscripcion !== undefined) datosParaActualizar.adscripcion = datosActualizar.adscripcion;
    if (datosActualizar.id_seccion !== undefined) datosParaActualizar.id_seccion = datosActualizar.id_seccion;
    if (datosActualizar.nivel_estudios !== undefined) datosParaActualizar.nivel_estudios = datosActualizar.nivel_estudios;
    if (datosActualizar.institucion_estudios !== undefined) datosParaActualizar.institucion_estudios = datosActualizar.institucion_estudios;
    if (datosActualizar.certificado_estudios !== undefined) datosParaActualizar.certificado_estudios = datosActualizar.certificado_estudios;
    if (datosActualizar.plaza_base !== undefined) datosParaActualizar.plaza_base = datosActualizar.plaza_base;

    // Siempre actualizar fecha_actualizacion
    datosParaActualizar.fecha_actualizacion = new Date();

    const trabajadorActualizado = await prisma.trabajadores.update({
      where: { id_trabajador: trabajadorId },
      data: datosParaActualizar
    });

    // Omitir contraseña_hash en la respuesta
    const { contraseña_hash, ...trabajadorSinPassword } = trabajadorActualizado;

    return res.status(200).json({
      success: true,
      message: 'Trabajador actualizado exitosamente',
      data: trabajadorSinPassword
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un trabajador con esos datos únicos (identificador, CURP, RFC, email, etc.)'
      });
    }
    console.error('Error al actualizar el trabajador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// Función adicional para actualizar último login
const actualizarUltimoLogin = async (req, res) => {
  try {
    const { id } = req.params;
    const trabajadorId = parseInt(id);

    if (isNaN(trabajadorId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del trabajador debe ser un número válido'
      });
    }

    await prisma.trabajadores.update({
      where: { id_trabajador: trabajadorId },
      data: { 
        ultimo_login: new Date(),
        intentos_fallidos: 0
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Último login actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar último login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// Función para manejar intentos fallidos de login
const registrarIntentoFallido = async (req, res) => {
  try {
    const { identificador } = req.body;

    const trabajador = await prisma.trabajadores.findUnique({
      where: { identificador }
    });

    if (!trabajador) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }

    const intentosFallidos = (trabajador.intentos_fallidos || 0) + 1;
    const bloqueado = intentosFallidos >= 5;

    await prisma.trabajadores.update({
      where: { identificador },
      data: { 
        intentos_fallidos: intentosFallidos,
        bloqueado: bloqueado
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Intento fallido registrado',
      data: { intentos_fallidos: intentosFallidos, bloqueado }
    });

  } catch (error) {
    console.error('Error al registrar intento fallido:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

module.exports = {
  validarTrabajador,
  crearTrabajador,
  eliminarTrabajador,
  obtenerTrabajadorPorId,
  actualizarTrabajador,
  actualizarUltimoLogin,
  registrarIntentoFallido
};