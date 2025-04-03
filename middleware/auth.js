// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Token requerido'
    });
  }

  try {
    // Formato: "Bearer TOKEN"
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken
};