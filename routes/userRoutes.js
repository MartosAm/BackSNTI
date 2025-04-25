// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware');
// Validaciones para la creación de usuario
const validarUsuario = [
  body('id_trabajador')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del trabajador debe ser un entero positivo'),
  body('identificador')
    .notEmpty()
    .withMessage('El identificador es obligatorio')
    .isLength({ max: 150 })
    .withMessage('El identificador no debe exceder los 150 caracteres'),
  body('contraseña')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['Administrador', 'Recursos Humanos', 'Empleado'])
    .withMessage('Rol inválido'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - identificador
 *         - contraseña
 *       properties:
 *         id_usuario:
 *           type: integer
 *           description: ID auto-incrementable del usuario
 *           readOnly: true
 *         id_trabajador:
 *           type: integer
 *           description: ID del trabajador asociado (opcional)
 *         identificador:
 *           type: string
 *           description: Nombre de usuario único
 *         contraseña:
 *           type: string
 *           description: Contraseña del usuario (se guarda hasheada)
 *         rol:
 *           type: string
 *           enum: ['Administrador', 'Recursos Humanos', 'Empleado']
 *           description: Rol del usuario
 *         intentos_fallidos:
 *           type: integer
 *           description: Número de intentos fallidos de inicio de sesión
 *           default: 0
 *         bloqueado:
 *           type: boolean
 *           description: Indica si el usuario está bloqueado
 *           default: false
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario
 *           readOnly: true
 *         ultimo_login:
 *           type: string
 *           format: date-time
 *           description: Última fecha de inicio de sesión
 *           nullable: true
 *         ultimo_cambio_password:
 *           type: string
 *           format: date-time
 *           description: Última fecha de cambio de contraseña
 *           nullable: true
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario (solo administradores)
 *     description: Crea un nuevo usuario en el sistema. Requiere autenticación y rol de administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                   example: 'Usuario creado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado. Token inválido o no proporcionado
 *       403:
 *         description: Acceso prohibido. No tienes permiso para crear usuarios
 *       409:
 *         description: El identificador o id_trabajador ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/',
  verifyToken,
  validarUsuario,
  userController.crearUsuario
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     description: Permite a un usuario registrado iniciar sesión y obtener un token JWT
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificador:
 *                 type: string
 *                 example: "usuario123"
 *               contraseña:
 *                 type: string
 *                 format: password
 *                 example: "contraseñaSegura"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Devuelve el token JWT
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
 *                   example: 'Inicio de sesión exitoso'
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1Ni..."
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/login',
  [
    body('identificador').notEmpty().withMessage('El identificador es requerido.'),
    body('contraseña').notEmpty().withMessage('La contraseña es requerida.'),
  ],
  userController.loginUsuario
);

module.exports = router;
module.exports.validarUsuario = validarUsuario;