//routes/index.js
const express = require('express');
const router = express.Router();
const trabajadorRoutes = require('./trabajadorRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const seccionRoutes = require('./seccionRoutes');
const { authMiddleware } = require('../middleware'); // Importa el objeto completo

router.use('/trabajadores', trabajadorRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken
router.use('/users', userRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken
router.use('/auth', authRoutes); 
router.use('/secciones', seccionRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken

// Ruta base para verificar que la API funcion
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        version: '1.0.0'
    });
});

module.exports = router;