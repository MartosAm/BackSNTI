// routes/hijosRoutes.js
const express = require('express');
const router = express.Router();
const { check, param } = require('express-validator');
const path = require('path');
const fs = require('fs');
const { multerErrorHandler } = require('../middleware/multer-error-handler');
const hijosController = require('../controllers/hijosController');
const { verifyToken } = require('../middleware');
const { uploadActaNacimiento, TIPOS_DOCUMENTOS } = require('../config/multerConfig');


// Asegurar que el directorio para actas de nacimiento exista
const actasDir = path.join(__dirname, '../uploads', TIPOS_DOCUMENTOS.ACTA_NACIMIENTO);
if (!fs.existsSync(actasDir)) {
  fs.mkdirSync(actasDir, { recursive: true });
}

/**
 * @swagger
 * /hijos:
 *   post:
 *     summary: Registrar un nuevo hijo y subir su acta de nacimiento (solo en PDF)
 *     tags: [Hijos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id_trabajador
 *               - nombre
 *               - apellido_paterno
 *               - apellido_materno
 *               - fecha_nacimiento
 *               - acta_nacimiento
 *             properties:
 *               id_trabajador:
 *                 type: integer
 *                 example: 123
 *                 description: ID del trabajador
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del hijo
 *               apellido_paterno:
 *                 type: string
 *                 example: "Pérez"
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Apellido paterno
 *               apellido_materno:
 *                 type: string
 *                 example: "Gómez"
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Apellido materno
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "2020-01-15"
 *                 description: Fecha de nacimiento (YYYY-MM-DD)
 *               acta_nacimiento:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del acta de nacimiento (PDF, JPEG, PNG, WEBP)
 *     responses:
 *       201:
 *         description: Hijo registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HijoResponse'
 *       400:
 *         $ref: '#/components/responses/400Error'
 *       401:
 *         $ref: '#/components/responses/401Error'
 *       500:
 *         $ref: '#/components/responses/500Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HijoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Hijo registrado exitosamente"
 *         data:
 *           type: object
 *           properties:
 *             hijo:
 *               $ref: '#/components/schemas/Hijo'
 *             documento:
 *               $ref: '#/components/schemas/Documento'
 *     
 *     Hijo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_trabajador:
 *           type: integer
 *           example: 123
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
 *           example: "2020-01-15"
 *     
 *     Documento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 15
 *         nombre_archivo:
 *           type: string
 *           example: "acta_nacimiento_juan.pdf"
 *         tipo:
 *           type: string
 *           example: "actas_nacimiento"
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error en la validación de datos"
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: integer
 *               example: 400
 *             details:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["El archivo debe ser PDF, JPEG, PNG o WEBP"]
 *   
 *   responses:
 *     400Error:
 *       description: Error de validación o archivo faltante
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     401Error:
 *       description: No autorizado - Token inválido o expirado
 *     500Error:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.post(
    '/',
    [
        verifyToken,
        uploadActaNacimiento.single('acta_nacimiento'), // Multer debe ir primero
        multerErrorHandler,
        check('id_trabajador').isInt().withMessage('ID del trabajador debe ser un número entero'),
        check('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        check('apellido_paterno').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido paterno debe tener entre 2 y 100 caracteres'),
        check('apellido_materno').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido materno debe tener entre 2 y 100 caracteres'),
        check('fecha_nacimiento').isISO8601().withMessage('La fecha de nacimiento debe estar en formatoYYYY-MM-DD')
    ],
    hijosController.registrarHijo
);


/**
 * @swagger
 * /hijos/trabajador/{id_trabajador}:
 *   get:
 *     summary: Obtener la lista de hijos de un trabajador
 *     tags: [Hijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_trabajador
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Lista de hijos obtenida exitosamente
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Hijo'
 *                       - type: object
 *                         properties:
 *                           documentos:
 *                             type: object
 *                             properties:
 *                               id_documento:
 *                                 type: integer
 *                               nombre_archivo:
 *                                 type: string
 *                               tipo_documento:
 *                                 type: string
 *                               fecha_subida:
 *                                 type: string
 *                                 format: date-time
 *                               ruta_almacenamiento:
 *                                 type: string
 *       400:
 *         description: ID del trabajador inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */


router.get(
  '/trabajador/:id_trabajador',
  [
    verifyToken,
    param('id_trabajador').isInt().withMessage('ID del trabajador inválido')
  ],
  hijosController.obtenerHijosPorTrabajador
);



/**
 * @swagger
 * /hijos/{id_hijo}:
 *   put:
 *     summary: Actualizar información de un hijo
 *     tags: [Hijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_hijo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hijo a actualizar
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del hijo
 *               apellido_paterno:
 *                 type: string
 *                 description: Apellido paterno del hijo
 *               apellido_materno:
 *                 type: string
 *                 description: Apellido materno del hijo
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento (YYYY-MM-DD)
 *               vigente:
 *                 type: boolean
 *                 description: Estado del registro (activo/inactivo)
 *               acta_nacimiento:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo PDF del acta de nacimiento (opcional)
 *     responses:
 *       200:
 *         description: Hijo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Hijo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put(
  '/:id_hijo',
  [
    verifyToken,
    param('id_hijo').isInt().withMessage('ID del hijo inválido'),
    check('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    check('apellido_paterno')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Apellido paterno debe tener entre 2 y 100 caracteres'),
    check('apellido_materno')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Apellido materno debe tener entre 2 y 100 caracteres'),
    check('fecha_nacimiento')
      .optional()
      .isDate()
      .withMessage('Fecha de nacimiento inválida (formato YYYY-MM-DD)'),
    check('vigente')
      .optional()
      .isBoolean()
      .withMessage('El campo vigente debe ser un valor booleano')
  ],
  uploadActaNacimiento.single('acta_nacimiento'),  multerErrorHandler,
  hijosController.actualizarHijo
);

/**
 * @swagger
 * /hijos/{id_hijo}:
 *   delete:
 *     summary: Eliminar un hijo (pemanente )
 *     tags: [Hijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_hijo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hijo a eliminar
 *     responses:
 *       200:
 *         description: Hijo eliminado exitosamente (baja lógica)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID del hijo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Hijo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete(
  '/:id_hijo',
  [
    verifyToken,
    param('id_hijo').isInt().withMessage('ID del hijo inválido')
  ],
  hijosController.eliminarHijo
);

module.exports = router;