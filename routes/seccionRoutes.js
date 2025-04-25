const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { verifyToken } = require('../middleware');
const seccionController = require('../controllers/seccionController');

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
 *           readOnly: true
 *         nombre_seccion:
 *           type: string
 *           maxLength: 100
 *         descripcion:
 *           type: string
 *           nullable: true
 *       example:
 *         id_seccion: 1
 *         nombre_seccion: "Recursos Humanos"
 *         descripcion: "Departamento de gestión de personal"
 */

/**
 * @swagger
 * /secciones:
 *   post:
 *     summary: Crear nueva sección
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seccion'
 *     responses:
 *       201:
 *         description: Sección creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: Validación fallida
 */
router.post(
  '/',
  [
    verifyToken,
    check('nombre_seccion')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nombre debe tener entre 3-100 caracteres'),
    check('descripcion')
      .optional()
      .trim()
      .isLength({ max: 255 })
  ],
  seccionController.crearSeccion
);

/**
 * @swagger
 * /secciones/{id}:
 *   get:
 *     summary: Obtener sección por ID
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sección obtenida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seccion'
 *       404:
 *         description: Sección no encontrada
 */
router.get('/:id', 
  verifyToken,
  seccionController.getSeccionPorId
);

module.exports = router;