// middleware/authorization.js
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Acceso prohibido. Rol no definido.'
      });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acceso prohibido. Rol no autorizado.'
      });
    }
  };
};

module.exports = {
  hasRole
};
