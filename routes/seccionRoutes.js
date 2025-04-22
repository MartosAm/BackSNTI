// routes/seccionRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth,  } = require('../middleware');
const { seccionController } = require('../controllers');
const { verifyToken } = require('../middleware'); // ✅ extrae directamente verifyToken

/**
 * @swagger
 * components:
 *   schemas:
 *     Seccion:
 *       type: object
 *       required:
 *         - nombre_seccion
 *       properties:
 *         id_seccion:
 *           type: integer
 *           description: ID único de la sección
 *         nombre_seccion:
 *           type: string
 *           description: Nombre de la sección
 *         descripcion:
 *           type: string
 *           description: Descripción de la sección
 *       example:
 *         id_seccion: 1
 *         nombre_seccion: "Departamento de Desarrollo"
 *         descripcion: "Equipo de desarrollo de software"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Secciones
 *   description: API para gestionar secciones
 */

/**
 * @swagger
 * /api/secciones:
 *   post:
 *     summary: Crea una nueva sección
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_seccion
 *             properties:
 *               nombre_seccion:
 *                 type: string
 *                 description: Nombre de la sección
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la sección (opcional)
 *     responses:
 *       201:
 *         description: Sección creada exitosamente
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
 *                   example: "Sección creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido - No tiene permisos suficientes
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/',
  [
    verifyToken,
    check('nombre_seccion', 'El nombre de la sección es obligatorio').not().isEmpty(),
    check('nombre_seccion', 'El nombre debe tener entre 3 y 100 caracteres').isLength({ min: 3, max: 100 }),
    check('descripcion', 'La descripción debe tener máximo 200 caracteres').optional().isLength({ max: 200 })
  ],
  seccionController.crearSeccion
);


// METODO GET DE SECCIONES POR ID
// routes/seccionRoutes.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Seccion:
 *       type: object
 *       required:
 *         - id_seccion
 *         - nombre_seccion
 *       properties:
 *         id_seccion:
 *           type: integer
 *           description: ID único de la sección
 *         nombre_seccion:
 *           type: string
 *           description: Nombre de la sección
 *         descripcion:
 *           type: string
 *           description: Descripción de la sección
 *       example:
 *         id_seccion: 1
 *         nombre_seccion: Administración
 *         descripcion: Sección encargada de la administración general
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/secciones/{id}:
 *   get:
 *     summary: Obtiene una sección por su ID
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sección a consultar
 *     responses:
 *       200:
 *         description: Sección encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: ID de sección inválido
 *       401:
 *         description: No autorizado, token JWT requerido
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */

// Usar verifyToken del middleware auth para proteger la ruta
router.get('/:id', verifyToken, seccionController.getSeccionPorId);
module.exports = router;