// routes/bootstrapRoutes.js
const express = require('express');
const router = express.Router();
const bootstrapController = require('../controllers/bootstrapController');
const { body } = require('express-validator');

// Validaciones para crear primer admin
const validacionPrimerAdmin = [
  // Campos de autenticación
  body('identificador')
    .notEmpty().withMessage('Identificador requerido')
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Entre 3 y 150 caracteres'),
  
  body('contraseña')
    .notEmpty().withMessage('Contraseña requerida')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Debe contener mayúscula, minúscula y número'),

  // Datos personales
  body('nombre')
    .notEmpty().withMessage('Nombre requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('apellido_paterno')
    .notEmpty().withMessage('Apellido paterno requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('apellido_materno')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('fecha_nacimiento')
    .notEmpty().withMessage('Fecha nacimiento requerida')
    .isISO8601().withMessage('Formato YYYY-MM-DD'),

  body('sexo')
    .notEmpty().withMessage('Sexo requerido')
    .isIn(['M', 'F']).withMessage('Valores válidos: M, F'),

  body('curp')
    .notEmpty().withMessage('CURP requerido')
    .trim()
    .isLength({ min: 18, max: 18 }).withMessage('18 caracteres exactos')
    .matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/).withMessage('Formato CURP inválido'),

  body('rfc')
    .notEmpty().withMessage('RFC requerido')
    .trim()
    .isLength({ min: 12, max: 13 }).withMessage('12 o 13 caracteres')
    .matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/).withMessage('Formato RFC inválido'),

  body('email')
    .notEmpty().withMessage('Email requerido')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Email inválido')
    .isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),

  // Campos laborales
  body('numero_empleado')
    .notEmpty().withMessage('Número empleado requerido')
    .trim()
    .isLength({ min: 1, max: 10 }).withMessage('Entre 1 y 10 caracteres'),

  body('numero_plaza')
    .notEmpty().withMessage('Número plaza requerido')
    .trim()
    .isLength({ min: 1, max: 8 }).withMessage('Entre 1 y 8 caracteres'),

  body('fecha_ingreso')
    .notEmpty().withMessage('Fecha ingreso requerida')
    .isISO8601().withMessage('Formato YYYY-MM-DD'),

  body('fecha_ingreso_gobierno')
    .notEmpty().withMessage('Fecha ingreso gobierno requerida')
    .isISO8601().withMessage('Formato YYYY-MM-DD'),

  body('nivel_puesto')
    .notEmpty().withMessage('Nivel puesto requerido')
    .trim()
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

  body('nombre_puesto')
    .notEmpty().withMessage('Nombre puesto requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('adscripcion')
    .notEmpty().withMessage('Adscripción requerida')
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('id_seccion')
    .notEmpty().withMessage('ID sección requerido')
    .isInt({ min: 1 }).withMessage('Debe ser entero positivo'),

  // Campos opcionales
  body('situacion_sentimental')
    .optional()
    .isIn(['Soltero', 'Casado', 'Divorciado', 'Viudo', 'UnionLibre'])
    .withMessage('Valor no válido'),

  body('numero_hijos')
    .optional()
    .isInt({ min: 0 }).withMessage('Debe ser número entero ≥ 0'),

  body('certificado_estudios')
    .optional()
    .isBoolean().withMessage('Debe ser true o false')
];

/**
 * @swagger
 * tags:
 *   - name: Bootstrap
 *     description: Inicialización del sistema
 */

/**
 * @swagger
 * /bootstrap/status:
 *   get:
 *     summary: Verifica estado de inicialización
 *     tags: [Bootstrap]
 *     responses:
 *       200:
 *         description: Estado del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bootstrap_requerido:
 *                       type: boolean
 *                     admin_existente:
 *                       type: boolean
 *                     info_admin:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         identificador:
 *                           type: string
 *                         fecha_creacion:
 *                           type: string
 *                           format: date-time
 *                         seccion:
 *                           type: string
 */
router.get('/status', bootstrapController.verificarEstadoBootstrap);

/**
 * @swagger
 * /bootstrap/first-admin:
 *   post:
 *     summary: Crea el primer administrador
 *     tags: [Bootstrap]
 *     parameters:
 *       - in: header
 *         name: X-Bootstrap-Token
 *         schema:
 *           type: string
 *         description: Token de seguridad opcional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificador
 *               - contraseña
 *               - nombre
 *               - apellido_paterno
 *               - fecha_nacimiento
 *               - sexo
 *               - curp
 *               - rfc
 *               - email
 *               - numero_empleado
 *               - numero_plaza
 *               - fecha_ingreso
 *               - fecha_ingreso_gobierno
 *               - nivel_puesto
 *               - nombre_puesto
 *               - adscripcion
 *               - id_seccion
 *             properties:
 *               identificador:
 *                 type: string
 *                 example: "admin01"
 *               contraseña:
 *                 type: string
 *                 example: "Admin123*"
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido_paterno:
 *                 type: string
 *                 example: "Pérez"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *                 example: "M"
 *               curp:
 *                 type: string
 *                 example: "PEPJ900101HDFXYZ01"
 *               rfc:
 *                 type: string
 *                 example: "PEPJ900101ABC"
 *               email:
 *                 type: string
 *                 example: "admin@empresa.com"
 *               numero_empleado:
 *                 type: string
 *                 example: "ADMIN001"
 *               numero_plaza:
 *                 type: string
 *                 example: "PLZ001"
 *               fecha_ingreso:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               fecha_ingreso_gobierno:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               nivel_puesto:
 *                 type: string
 *                 example: "Directivo"
 *               nombre_puesto:
 *                 type: string
 *                 example: "Administrador"
 *               adscripcion:
 *                 type: string
 *                 example: "TI"
 *               id_seccion:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Administrador creado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Administrador ya existe
 *       409:
 *         description: Conflicto de datos
 *       500:
 *         description: Error del servidor
 */
router.post('/first-admin', validacionPrimerAdmin, bootstrapController.crearPrimerAdmin);

module.exports = router;


