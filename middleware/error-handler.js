// middleware/error-handler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Error de Prisma
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      message: 'Error de base de datos',
      error: err.message
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: err.message
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token no válido',
      error: err.message
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error del servidor',
    error: err.message
  });
};

module.exports = errorHandler;