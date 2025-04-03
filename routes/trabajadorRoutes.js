// routes/trabajadorRoutes.js
const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadorController');
const authMiddleware = require('../middleware/index');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.verifyToken);

// Rutas para trabajadores
router.post('/', trabajadorController.crearTrabajador);
router.get('/', trabajadorController.obtenerTrabajadores);
router.get('/:id', trabajadorController.obtenerTrabajadorPorId);
router.put('/:id', trabajadorController.actualizarTrabajador);
router.delete('/:id', trabajadorController.eliminarTrabajador);

module.exports = router;