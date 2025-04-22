// middleware/authorization.js
const hasRole = (roles) => {
  if (!Array.isArray(roles)) {
    throw new Error('Los roles deben ser un array');
  }

  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Rol no definido en el token'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso prohibido. Rol requerido: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { hasRole };