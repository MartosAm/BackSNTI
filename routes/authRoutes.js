// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: Obtener un token JWT para pruebas
 *     tags: [Autenticación]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: string
 *                   example: 1d
 *       500:
 *         description: Error del servidor
 */
router.post('/token', (req, res) => {
  try {
    // Para propósitos de desarrollo/pruebas, simplemente generamos un token
    // En producción, aquí verificarías credenciales
    const payload = {
      id: 1,
      username: req.body.username || 'admin',
      role: 'ADMIN', // Asumiendo que tienes roles como 'ADMIN', 'USER', etc.
      permissions: ['CREATE_TRABAJADOR', 'READ_TRABAJADOR', 'UPDATE_TRABAJADOR', 'DELETE_TRABAJADOR']
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
  } catch (error) {
    console.error('Error al generar token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar token',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar un token JWT
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.get('/verify', (req, res) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

module.exports = router;