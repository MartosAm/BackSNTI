// routes/index.js

const express = require('express');
const router = express.Router();

// Importar rutas individuales
const trabajadorRoutes = require('./trabajadorRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const documentoRoutes = require('./documentoRoutes');
// ... otras rutas

// Usar rutas individuales
router.use('/trabajadores', trabajadorRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/documentos', documentoRoutes);
// ... usar otras rutas

module.exports = router;