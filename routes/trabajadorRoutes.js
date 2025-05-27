// File: routes/trabajadoresRoutes.js
const express = require("express");
const router = express.Router();
const {
    validarTrabajador,
    crearTrabajador,
    eliminarTrabajador,
    obtenerTrabajadorPorId,
    actualizarTrabajador,
    listarTrabajadores,
    miPerfil,
    actualizarUltimoLogin,
    registrarIntentoFallido
} = require("../controllers/trabajadorController");
const { verifyToken } = require("../middleware/auth");
const { hasRole } = require("../middleware/authorization");
const Roles = require('../enums/roles.enum');

/**
 * @swagger
 * tags:
 *   - name: Trabajadores
 *     description: Endpoints para administrar y consultar información de trabajadores
 */

/**
 * @swagger
 * /api/trabajadores:
 *   get:
 *     summary: Lista todos los trabajadores del sistema
 *     description: Permite a los ADMINISTRADORES obtener un listado completo de todos los trabajadores registrados.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trabajadores obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrabajadorOutput'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       403:
 *         $ref: '#/components/responses/403Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.get(
  "/",
  verifyToken,
  hasRole([Roles.ADMINISTRADOR]),
  listarTrabajadores
);

/**
 * @swagger
 * /api/trabajadores/mi-perfil:
 *   get:
 *     summary: Obtiene el perfil del trabajador autenticado
 *     description: Retorna la información detallada del trabajador que está actualmente autenticado, basado en el token JWT.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del trabajador autenticado obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrabajadorOutput'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       404:
 *         $ref: '#/components/responses/404Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.get(
  "/mi-perfil",
  verifyToken,
  miPerfil
);

/**
 * @swagger
 * /api/trabajadores:
 *   post:
 *     summary: Crea un nuevo trabajador
 *     description: Permite a un ADMINISTRADOR crear un nuevo registro de trabajador en el sistema.
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
 *         description: Trabajador creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrabajadorResponse'
 *       400:
 *         $ref: '#/components/responses/400Error'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       403:
 *         $ref: '#/components/responses/403Error'
 *       409:
 *         $ref: '#/components/responses/409Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.post(
  "/",
  verifyToken,
  hasRole([Roles.ADMINISTRADOR]),
  validarTrabajador,
  crearTrabajador
);

/**
 * @swagger
 * /api/trabajadores/{id}:
 *   get:
 *     summary: Obtener un trabajador por su ID
 *     description: Retorna la información de un trabajador específico basado en su ID. Solo accesible por ADMINISTRADORES.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del trabajador a obtener.
 *     responses:
 *       200:
 *         description: Trabajador encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrabajadorOutput'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       403:
 *         $ref: '#/components/responses/403Error'
 *       404:
 *         $ref: '#/components/responses/404Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.get(
  "/:id",
  verifyToken,
  hasRole([Roles.ADMINISTRADOR]),
  obtenerTrabajadorPorId
);

/**
 * @swagger
 * /api/trabajadores/{id}:
 *   put:
 *     summary: Actualiza completamente un trabajador por su ID
 *     description: Permite a un ADMINISTRADOR actualizar toda la información de un trabajador existente.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del trabajador a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrabajadorUpdateInput'
 *     responses:
 *       200:
 *         description: Trabajador actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrabajadorResponse'
 *       400:
 *         $ref: '#/components/responses/400Error'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       403:
 *         $ref: '#/components/responses/403Error'
 *       404:
 *         $ref: '#/components/responses/404Error'
 *       409:
 *         $ref: '#/components/responses/409Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.put(
  '/:id',
  verifyToken,
  hasRole([Roles.ADMINISTRADOR]),
  validarTrabajador,
  actualizarTrabajador
);

/**
 * @swagger
 * /api/trabajadores/{id}:
 *   delete:
 *     summary: Elimina un trabajador por su ID
 *     description: Permite a un ADMINISTRADOR eliminar un trabajador del sistema.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del trabajador a eliminar.
 *     responses:
 *       200:
 *         description: Trabajador eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/400Error'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       403:
 *         $ref: '#/components/responses/403Error'
 *       404:
 *         $ref: '#/components/responses/404Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.delete(
  "/:id",
  verifyToken,
  hasRole([Roles.ADMINISTRADOR]),
  eliminarTrabajador
);

/**
 * @swagger
 * /api/trabajadores/update-last-login/{id}:
 *   patch:
 *     summary: Actualiza la marca de tiempo del último inicio de sesión de un trabajador
 *     description: Ruta interna para actualizar último login después de autenticación exitosa.
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Último login actualizado
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       403:
 *         $ref: '#/components/responses/403Error'
 *       404:
 *         $ref: '#/components/responses/404Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.patch(
  "/update-last-login/:id",
  verifyToken,
  actualizarUltimoLogin
);

/**
 * @swagger
 * /api/trabajadores/register-failed-attempt:
 *   post:
 *     summary: Registra un intento de inicio de sesión fallido
 *     description: Registra intentos fallidos para lógica de bloqueo de cuentas.
 *     tags: [Trabajadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificador
 *             properties:
 *               identificador:
 *                 type: string
 *                 example: "usuario.ejemplo"
 *     responses:
 *       200:
 *         description: Intento registrado
 *       404:
 *         $ref: '#/components/responses/404Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */
router.post(
  "/register-failed-attempt",
  registrarIntentoFallido
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     TrabajadorInput:
 *       type: object
 *       required:
 *         - identificador
 *         - password
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
 *         identificador:
 *           type: string
 *           example: "juan.perez"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, USUARIO]
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
 *           enum: [Soltero, Casado, Divorciado, Viudo, "Union Libre"]
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
 *           enum: [Temporal, Definitiva]
 * 
 *     TrabajadorUpdateInput:
 *       type: object
 *       properties:
 *         identificador:
 *           type: string
 *         password:
 *           type: string
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, USUARIO]
 *         nombre:
 *           type: string
 *         apellido_paterno:
 *           type: string
 *         apellido_materno:
 *           type: string
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *         sexo:
 *           type: string
 *           enum: [M, F]
 *         curp:
 *           type: string
 *         rfc:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         situacion_sentimental:
 *           type: string
 *           enum: [Soltero, Casado, Divorciado, Viudo, "Union Libre"]
 *         numero_hijos:
 *           type: integer
 *         numero_empleado:
 *           type: string
 *         numero_plaza:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         fecha_ingreso_gobierno:
 *           type: string
 *           format: date
 *         nivel_puesto:
 *           type: string
 *         nombre_puesto:
 *           type: string
 *         puesto_inpi:
 *           type: string
 *         adscripcion:
 *           type: string
 *         id_seccion:
 *           type: integer
 *         nivel_estudios:
 *           type: string
 *         institucion_estudios:
 *           type: string
 *         certificado_estudios:
 *           type: boolean
 *         plaza_base:
 *           type: string
 *           enum: [Temporal, Definitiva]
 * 
 *     TrabajadorOutput:
 *       type: object
 *       properties:
 *         id_trabajador:
 *           type: integer
 *           readOnly: true
 *         identificador:
 *           type: string
 *         rol:
 *           type: string
 *         nombre:
 *           type: string
 *         apellido_paterno:
 *           type: string
 *         apellido_materno:
 *           type: string
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *         sexo:
 *           type: string
 *         curp:
 *           type: string
 *         rfc:
 *           type: string
 *         email:
 *           type: string
 *         situacion_sentimental:
 *           type: string
 *         numero_hijos:
 *           type: integer
 *         numero_empleado:
 *           type: string
 *         numero_plaza:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         fecha_ingreso_gobierno:
 *           type: string
 *           format: date
 *         nivel_puesto:
 *           type: string
 *         nombre_puesto:
 *           type: string
 *         puesto_inpi:
 *           type: string
 *         adscripcion:
 *           type: string
 *         id_seccion:
 *           type: integer
 *         nivel_estudios:
 *           type: string
 *         institucion_estudios:
 *           type: string
 *         certificado_estudios:
 *           type: boolean
 *         plaza_base:
 *           type: string
 *         ultimo_login:
 *           type: string
 *           format: date-time
 *         intentos_fallidos:
 *           type: integer
 *         bloqueado:
 *           type: boolean
 * 
 *     TrabajadorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/TrabajadorOutput'
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 * 
 *   responses:
 *     400Error:
 *       description: Error de validación
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     401Error:
 *       description: No autorizado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     403Error:
 *       description: Acceso prohibido
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     404Error:
 *       description: Recurso no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     409Error:
 *       description: Conflicto de datos
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     500Error:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 * 
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 */

module.exports = router;