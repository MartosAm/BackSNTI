// File: routes/trabajadorRoutes.js
const express = require("express");
const router = express.Router();
const trabajadorController = require("../controllers/trabajadorController");
const { authMiddleware, authorizationMiddleware } = require("../middleware"); // Asegúrate de importar con el nombre correcto
const { body, param, validationResult } = require('express-validator');
const { PrismaClient, rol_usuario } = require('@prisma/client');


const Roles = rol_usuario;

/**
 * @swagger
 * tags:
 *   - name: Trabajadores
 *     description: Endpoints para administrar trabajadores
 */

/**
 * @swagger
 * /trabajadores:
 *   post:
 *     summary: Crea un nuevo trabajador
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrabajadorInput'
 *     responses:
 *       201:
 *         description: Trabajador creado exitosamente
 *       400:
 *         description: Datos de trabajador inválidos
 *       401:
 *         description: No autorizado
 */
router.post(
   "/",
  authMiddleware.verifyToken,
  authorizationMiddleware.hasRole([Roles.ADMINISTRADOR]), 
  trabajadorController.validarTrabajador,
  trabajadorController.crearTrabajador
);

// Versión temporal para registrar el primer admin:

/**
 * @swagger
 * /trabajadores/{id}:
 *   delete:
 *     summary: Elimina un trabajador por su ID
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del trabajador a eliminar
 *     responses:
 *       200:
 *         description: Trabajador eliminado exitosamente
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
 *                   example: "Trabajador eliminado exitosamente"
 *       400:
 *         description: ID de trabajador inválido o el trabajador no puede ser eliminado por restricciones de integridad
 *       401:
 *         description: No autorizado, token JWT requerido
 *       403:
 *         description: Prohibido - No tiene permisos suficientes
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error del servidor
 */

router.delete(
  "/:id",
  authMiddleware.verifyToken,
  trabajadorController.eliminarTrabajador
);

/**
 * @swagger
 * /trabajadores/{id}:
 *  get:
 *    summary: Obtener un trabajador por su ID
 *    description: Retorna la información de un trabajador específico basado en su ID.
 *    tags: [Trabajadores]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del trabajador a obtener
 *    responses:
 *      200:
 *        description: Trabajador encontrado
 *        content:
 *          application/json:
 *            schema:
 *             type: object
 *      401:
 *        description: No autorizado, token JWT requerido
 *      404:
 *        description: Trabajador no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: false
 *                message:
 *                  type: string
 *                  example: "Trabajador con ID 123 no encontrado"
 *      500:
 *        description: Error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: false
 *                message:
 *                  type: string
 *                  example: "Error al obtener el trabajador"
 */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  trabajadorController.obtenerTrabajadorPorId
);

/*

RUTA HTTP PATCH PARA ACTUALIZAR

*/

/**
 * @swagger
 * /trabajadores/{id}:
 *   patch:
 *     summary: Actualizar un trabajador por su ID usando función almacenada
 *     description: Actualiza la información de un trabajador existente utilizando la función almacenada sp_actualizar_trabajador.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nuevo Nombre"
 *               apellido_paterno:
 *                 type: string
 *                 example: "Nuevo Apellido"
 *               apellido_materno:
 *                 type: string
 *                 example: "Nuevo Materno"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1995-03-10"
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *                 example: "F"
 *               curp:
 *                 type: string
 *                 example: "NUEV123456ABCDEF01"
 *               rfc:
 *                 type: string
 *                 example: "NUEV123456XYZ"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo.email@example.com"
 *               situacion_sentimental:
 *                 type: string
 *                 enum: [Soltero, Casado, Divorciado, Viudo, "Union Libre"]
 *                 example: "Casado"
 *               numero_hijos:
 *                 type: integer
 *                 example: 1
 *               numero_empleado:
 *                 type: string
 *                 example: "NEMP98765"
 *               numero_plaza:
 *                 type: string
 *                 example: "NPLAZA2"
 *               fecha_ingreso:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               fecha_ingreso_gobierno:
 *                 type: string
 *                 format: date
 *                 example: "2020-05-20"
 *               nivel_puesto:
 *                 type: string
 *                 example: "Coordinador"
 *               nombre_puesto:
 *                 type: string
 *                 example: "Coordinador de Proyectos"
 *               puesto_inpi:
 *                 type: string
 *                 example: "Especialista Senior"
 *               adscripcion:
 *                 type: string
 *                 example: "Oficina Regional"
 *               id_seccion:
 *                 type: integer
 *                 example: 2
 *               nivel_estudios:
 *                 type: string
 *                 example: "Posgrado"
 *               institucion_estudios:
 *                 type: string
 *                 example: "Universidad Estatal"
 *               certificado_estudios:
 *                 type: boolean
 *                 example: true
 *               plaza_base:
 *                 type: string
 *                 enum: ["Temporal", "Definitiva"]
 *                 example: "Definitiva"
 *     responses:
 *       200:
 *         description: Trabajador actualizado exitosamente
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
 *                   example: "Trabajador actualizado exitosamente"
 *                 data:
 *       400:
 *         description: Datos de actualización inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch(
  '/:id',
  authMiddleware.verifyToken,
  [
    param('id').isInt().withMessage('El ID del trabajador debe ser un número entero.'),
    body('nombre').optional().isLength({ max: 100 }).withMessage('El nombre debe tener máximo 100 caracteres.'),
    body('apellido_paterno').optional().isLength({ max: 100 }).withMessage('El apellido paterno debe tener máximo 100 caracteres.'),
    body('apellido_materno').optional().isLength({ max: 100 }).withMessage('El apellido materno debe tener máximo 100 caracteres.'),
    body('fecha_nacimiento').optional().isISO8601().withMessage('Formato de fecha de nacimiento inválido (YYYY-MM-DD).'),
    body('sexo').optional().isIn(['M', 'F']).withMessage('Valor de sexo no válido (M o F).'),
    body('curp').optional().isLength({ min: 18, max: 18 }).matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/).withMessage('Formato de CURP inválido.'),
    body('rfc').optional().isLength({ min: 13, max: 13 }).matches(/^[A-Z]{4}\d{6}[0-9A-Z]{3}$/).withMessage('Formato de RFC inválido.'),
    body('email').optional().isEmail().isLength({ max: 150 }).withMessage('Formato de email inválido.'),
    body('situacion_sentimental').optional().isIn(['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Union Libre']).withMessage('Valor de situación sentimental no válido.'),
    body('numero_hijos').optional().isInt({ min: 0 }).withMessage('El número de hijos debe ser un entero no negativo.'),
    body('numero_empleado').optional().isLength({ min: 10, max: 10 }).withMessage('El número de empleado debe tener 10 caracteres.'),
    body('numero_plaza').optional().isLength({ min: 8, max: 8 }).withMessage('El número de plaza debe tener 8 caracteres.'),
    body('fecha_ingreso').optional().isISO8601().withMessage('Formato de fecha de ingreso inválido (YYYY-MM-DD).'),
    body('fecha_ingreso_gobierno').optional().isISO8601().withMessage('Formato de fecha de ingreso al gobierno inválido (YYYY-MM-DD).'),
    body('nivel_puesto').optional().isLength({ max: 50 }).withMessage('El nivel de puesto debe tener máximo 50 caracteres.'),
    body('nombre_puesto').optional().isLength({ max: 100 }).withMessage('El nombre del puesto debe tener máximo 100 caracteres.'),
    body('puesto_inpi').optional().isLength({ max: 100 }).withMessage('El puesto INPI debe tener máximo 100 caracteres.'),
    body('adscripcion').optional().isLength({ max: 100 }).withMessage('La adscripción debe tener máximo 100 caracteres.'),
    body('id_seccion').optional().isInt().withMessage('El ID de la sección debe ser un entero.'),
    body('nivel_estudios').optional().isLength({ max: 100 }).withMessage('El nivel de estudios debe tener máximo 100 caracteres.'),
    body('institucion_estudios').optional().isLength({ max: 200 }).withMessage('La institución de estudios debe tener máximo 200 caracteres.'),
    body('certificado_estudios').optional().isBoolean().withMessage('El certificado de estudios debe ser un booleano.'),
    body('plaza_base').optional().isIn(['Temporal', 'Definitiva']).withMessage('El tipo de plaza debe ser "Temporal" o "Definitiva".'),
  ],
  trabajadorController.actualizarTrabajador
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     TrabajadorInput:
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
 *         nombre:
 *           type: string
 *           example: "Juan"
 *         apellido_paterno:
 *           type: string
 *           example: "Pérez"
 *         apellido_materno:
 *           type: string
 *           example: "Gómez"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1980-01-01"
 *         sexo:
 *           type: string
 *           enum: [M, F]
 *           example: "M"
 *         curp:
 *           type: string
 *           example: "PEGJ800101HDFRSN01"
 *         rfc:
 *           type: string
 *           example: "PEGJ800101XXX"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan.perez@example.com"
 *         situacion_sentimental:
 *           type: string
 *           enum: [soltero, casado, divorciado, viudo]
 *         numero_hijos:
 *           type: integer
 *           minimum: 0
 *         numero_empleado:
 *           type: string
 *           example: "EMP001234"
 *         numero_plaza:
 *           type: string
 *           example: "PLZ00123"
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           example: "2020-01-01"
 *         fecha_ingreso_gobierno:
 *           type: string
 *           format: date
 *           example: "2015-01-01"
 *         nivel_puesto:
 *           type: string
 *           example: "Ejecutivo"
 *         nombre_puesto:
 *           type: string
 *           example: "Analista Senior"
 *         puesto_inpi:
 *           type: string
 *           example: "Especialista"
 *         adscripcion:
 *           type: string
 *           example: "Departamento de TI"
 *         id_seccion:
 *           type: integer
 *           example: 1
 *         nivel_estudios:
 *           type: string
 *           example: "Licenciatura"
 *         institucion_estudios:
 *           type: string
 *           example: "Universidad Nacional"
 *         certificado_estudios:
 *           type: boolean
 *         plaza_base:
 *           type: string
 *           example: "Temporal o Permanente"
 */

module.exports = router;