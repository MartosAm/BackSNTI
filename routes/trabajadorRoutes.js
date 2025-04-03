// routes/trabajadorRoutes.js
const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadorController');
const { auth } = require('../middleware');

/**
 * @swagger
 * tags:
 *   name: Trabajadores
 *   description: Endpoints para administrar trabajadores
 */

// Ruta para crear un trabajador
router.post(
  '/',
  auth.verifyToken,
  trabajadorController.validarTrabajador,
  trabajadorController.crearTrabajador
);

module.exports = router;