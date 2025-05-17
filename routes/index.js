//routes/index.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // Importa multer para manejar archivos
const { authMiddleware, authorizationMiddleware  } = require('../middleware'); // Importa el objeto completo


// Importa los enrutadores de las diferentes rutas
const trabajadorRoutes = require('./trabajadorRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const seccionRoutes = require('./seccionRoutes');
const documentoRoutes = require('./documentoRoutes'); // Ajusta la ruta si es necesario
const hijosRoutes = require('./hijosRoutes'); // Ajusta la ruta si es necesario




// router use para manejo de archivos e importacion del middleware
router.use('/trabajadores', trabajadorRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken
router.use('/users', userRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken
router.use('/auth', authRoutes); 
router.use('/secciones', seccionRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken
router.use('/documentos', documentoRoutes, authMiddleware.verifyToken, authorizationMiddleware.hasRole  ); // Usa la propiedad .verifyToken
router.use('/hijos', hijosRoutes, authMiddleware.verifyToken); // Usa la propiedad .verifyToken


// Ruta base para verificar que la API funcion
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        version: '1.0.0'
    });
});

module.exports = router;