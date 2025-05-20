// middleware/authorization.js
const Roles = require('../enums/roles.enum');

const hasRole = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error('Los roles deben ser un array');
  }

  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Rol no definido en el token'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso prohibido. Rol requerido: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { hasRole };
