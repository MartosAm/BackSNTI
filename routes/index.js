// routes/index.js
const express = require('express');
const router = express.Router();
const trabajadorRoutes = require('./trabajadorRoutes');
const userRoutes = require('./userRoutes'); // Asegúrate de que esta línea exista
const authRoutes = require('./authRoutes');

router.use('/trabajadores', trabajadorRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Asegúrate de que esta línea exista
// Ruta base para verificar que la API funciona
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    version: '1.0.0'
  });
});

module.exports = router;