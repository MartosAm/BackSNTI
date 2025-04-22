// routes/index.js
const express = require('express');
const router = express.Router();
const trabajadorRoutes = require('./trabajadorRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const seccionRoutes = require('./seccionRoutes');

router.use('/trabajadores', trabajadorRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/secciones', seccionRoutes);

// Ruta base para verificar que la API funciona
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    version: '1.0.0'
  });
});

module.exports = router;