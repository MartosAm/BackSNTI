// routes/index.js
const express = require('express');
const router = express.Router();
const trabajadorRoutes = require('./trabajadorRoutes');

router.use('/trabajadores', trabajadorRoutes);

// Ruta base para verificar que la API funciona
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    version: '1.0.0'
  });
});

module.exports = router;