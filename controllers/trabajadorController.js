const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();

const validarTrabajador = [
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
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, rfc,
      email, situacion_sentimental, numero_hijos, numero_empleado, numero_plaza,
      fecha_ingreso, fecha_ingreso_gobierno, nivel_puesto, nombre_puesto, puesto_inpi,
      adscripcion, id_seccion, nivel_estudios, institucion_estudios, certificado_estudios,
      plaza_base
    } = req.body;

    const fechaNacimientoDate = new Date(fecha_nacimiento);
    const fechaIngresoDate = new Date(fecha_ingreso);
    const fechaIngresoGobiernoDate = new Date(fecha_ingreso_gobierno);

    const existente = await prisma.trabajadores.findFirst({
      where: {
        OR: [
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

    const nuevoTrabajador = await prisma.trabajadores.create({
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento: fechaNacimientoDate,
        sexo,
        curp,
        rfc,
        email,
        situacion_sentimental,
        numero_hijos,
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

    return res.status(201).json({ success: true, message: 'Trabajador creado exitosamente', data: nuevoTrabajador });

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

//GET 


/**
 * Obtener un trabajador por su ID utilizando la función almacenada
 * @param {object} req - Objeto de solicitud de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función siguiente de Express
 * 
 */const obtenerTrabajadorPorId = async (req, res) => {
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
        seccion: true, // Esto carga la tabla relacionada "secciones"
        sanciones: true, // También puedes incluir otras relaciones
        trabajadores_cursos: true
      }
    });

    if (!trabajador) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: trabajador
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

    // Actualiza los campos que fueron enviados (PATCH parcial)

    //      await prisma.$queryRaw`SELECT public.sp_descargar_documento(${parseInt( ORM 

    const trabajadorActualizado = await prisma.trabajadores.update({
      where: { id_trabajador: trabajadorId },
      data: {
        nombre: datosActualizar.nombre,
        apellido_paterno: datosActualizar.apellido_paterno,
        apellido_materno: datosActualizar.apellido_materno,
        fecha_nacimiento: datosActualizar.fecha_nacimiento ? new Date(datosActualizar.fecha_nacimiento) : undefined,
        sexo: datosActualizar.sexo,
        curp: datosActualizar.curp,
        rfc: datosActualizar.rfc,
        email: datosActualizar.email,
        situacion_sentimental: datosActualizar.situacion_sentimental,
        numero_hijos: datosActualizar.numero_hijos,
        numero_empleado: datosActualizar.numero_empleado,
        numero_plaza: datosActualizar.numero_plaza,
        fecha_ingreso: datosActualizar.fecha_ingreso ? new Date(datosActualizar.fecha_ingreso) : undefined,
        fecha_ingreso_gobierno: datosActualizar.fecha_ingreso_gobierno ? new Date(datosActualizar.fecha_ingreso_gobierno) : undefined,
        nivel_puesto: datosActualizar.nivel_puesto,
        nombre_puesto: datosActualizar.nombre_puesto,
        puesto_inpi: datosActualizar.puesto_inpi,
        adscripcion: datosActualizar.adscripcion,
        id_seccion: datosActualizar.id_seccion,
        nivel_estudios: datosActualizar.nivel_estudios,
        institucion_estudios: datosActualizar.institucion_estudios,
        certificado_estudios: datosActualizar.certificado_estudios,
        plaza_base: datosActualizar.plaza_base,
        fecha_actualizacion: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Trabajador actualizado exitosamente',
      data: trabajadorActualizado
    });

  } catch (error) {
    console.error('Error al actualizar el trabajador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

module.exports = {
  validarTrabajador, // Exporta el middleware de validación
  crearTrabajador,
  eliminarTrabajador,
  obtenerTrabajadorPorId,
  actualizarTrabajador
};