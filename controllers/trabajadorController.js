// controllers/trabajadorController.js
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();

// Validaciones para la creación de trabajador
const validarTrabajador = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('apellido_paterno').notEmpty().withMessage('El apellido paterno es obligatorio').isLength({ max: 100 }),
  body('apellido_materno').optional().isLength({ max: 100 }),
  body('fecha_nacimiento').notEmpty().withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('sexo').notEmpty().withMessage('El sexo es obligatorio')
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO']).withMessage('Valor de sexo no válido'),
  body('curp').notEmpty().withMessage('El CURP es obligatorio')
    .isLength({ min: 18, max: 18 }).withMessage('El CURP debe tener 18 caracteres')
    .matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/).withMessage('Formato de CURP inválido'),
  body('rfc').notEmpty().withMessage('El RFC es obligatorio')
    .isLength({ min: 13, max: 13 }).withMessage('El RFC debe tener 13 caracteres')
    .matches(/^[A-Z]{4}\d{6}[0-9A-Z]{3}$/).withMessage('Formato de RFC inválido'),
  body('email').notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Formato de email inválido').isLength({ max: 150 }),
  body('situacion_sentimental').optional()
    .isIn(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION LIBRE']).withMessage('Valor de situación sentimental no válido'),
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Trabajador:
 *       type: object
 *       required:
 *         - nombre
 *         - apellido_paterno
 *         - fecha_nacimiento
 *         - sexo
 *         - curp
 *         - rfc
 *         - email
 *         - numero_empleado
 *         - numero_plaza
 *         - fecha_ingreso
 *         - fecha_ingreso_gobierno
 *         - nivel_puesto
 *         - nombre_puesto
 *         - adscripcion
 *         - id_seccion
 *       properties:
 *         id_trabajador:
 *           type: integer
 *           description: ID auto-incrementable del trabajador
 *         nombre:
 *           type: string
 *           description: Nombre del trabajador
 *         apellido_paterno:
 *           type: string
 *           description: Apellido paterno del trabajador
 *         apellido_materno:
 *           type: string
 *           description: Apellido materno del trabajador
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento (YYYY-MM-DD)
 *         sexo:
 *           type: string
 *           enum: [MASCULINO, FEMENINO, OTRO]
 *           description: Sexo del trabajador
 *         curp:
 *           type: string
 *           description: CURP (18 caracteres)
 *         rfc:
 *           type: string
 *           description: RFC (13 caracteres)
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico
 *         situacion_sentimental:
 *           type: string
 *           enum: [SOLTERO, CASADO, DIVORCIADO, VIUDO, UNION LIBRE]
 *           description: Situación sentimental
 *         numero_hijos:
 *           type: integer
 *           description: Número de hijos
 *           default: 0
 *         numero_empleado:
 *           type: string
 *           description: Número de empleado (10 caracteres)
 *         numero_plaza:
 *           type: string
 *           description: Número de plaza (8 caracteres)
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           description: Fecha de ingreso (YYYY-MM-DD)
 *         fecha_ingreso_gobierno:
 *           type: string
 *           format: date
 *           description: Fecha de ingreso al gobierno (YYYY-MM-DD)
 *         nivel_puesto:
 *           type: string
 *           description: Nivel del puesto
 *         nombre_puesto:
 *           type: string
 *           description: Nombre del puesto
 *         puesto_inpi:
 *           type: string
 *           description: Puesto INPI
 *         adscripcion:
 *           type: string
 *           description: Adscripción
 *         id_seccion:
 *           type: integer
 *           description: ID de la sección
 *         nivel_estudios:
 *           type: string
 *           description: Nivel de estudios
 *         institucion_estudios:
 *           type: string
 *           description: Institución educativa
 *         certificado_estudios:
 *           type: boolean
 *           description: Si tiene certificado de estudios
 *         plaza_base:
 *           type: string
 *           description: Plaza base
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/trabajadores:
 *   post:
 *     summary: Crear un nuevo trabajador
 *     description: Registra un nuevo trabajador en el sistema
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trabajador'
 *     responses:
 *       201:
 *         description: Trabajador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Trabajador creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Trabajador'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Conflicto (datos duplicados)
 *       500:
 *         description: Error del servidor
 */
const crearTrabajador = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const {
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, rfc, 
      email, situacion_sentimental, numero_hijos, numero_empleado, numero_plaza, 
      fecha_ingreso, fecha_ingreso_gobierno, nivel_puesto, nombre_puesto, puesto_inpi, 
      adscripcion, id_seccion, nivel_estudios, institucion_estudios, certificado_estudios, 
      plaza_base
    } = req.body;

    // Verificar si ya existe un trabajador con datos únicos
    const existente = await prisma.trabajador.findFirst({
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
      // Determinar qué campo está duplicado
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

    // Crear el trabajador
    const nuevoTrabajador = await prisma.trabajador.create({
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento: new Date(fecha_nacimiento),
        sexo,
        curp,
        rfc,
        email,
        situacion_sentimental,
        numero_hijos: parseInt(numero_hijos) || 0,
        numero_empleado,
        numero_plaza,
        fecha_ingreso: new Date(fecha_ingreso),
        fecha_ingreso_gobierno: new Date(fecha_ingreso_gobierno),
        nivel_puesto,
        nombre_puesto,
        puesto_inpi,
        adscripcion,
        id_seccion: parseInt(id_seccion),
        nivel_estudios,
        institucion_estudios,
        certificado_estudios: certificado_estudios === true,
        plaza_base
      }
    });

    res.status(201).json({
      success: true,
      message: 'Trabajador creado exitosamente',
      data: nuevoTrabajador
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validarTrabajador,
  crearTrabajador
};