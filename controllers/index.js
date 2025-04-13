const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const trabajadorRoutes = require('./trabajadorRoutes');
const userRoutes = require('./userRoutes'); // Importa las rutas de usuario

router.use('/auth', authRoutes);
router.use('/trabajadores', trabajadorRoutes);
router.use('/users', userRoutes); // Monta las rutas de usuario bajo /api/users

module.exports = router;