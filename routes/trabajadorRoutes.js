// File: routes/trabajadorRoutes.js
const express = require("express");
const router = express.Router();
const trabajadorController = require("../controllers/trabajadorController");
const { authMiddleware } = require("../middleware"); // Asegúrate de importar con el nombre correcto

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
  trabajadorController.validarTrabajador,
  trabajadorController.crearTrabajador
);

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
