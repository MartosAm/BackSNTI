const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'administrador') {
      next();
    } else {
      res.status(403).json({ message: 'Acceso prohibido.' });
    }
  };
  
  const hasPermission = (permission) => {
    return (req, res, next) => {
      if (req.user && req.user.permissions.includes(permission)) {
        next();
      } else {
        res.status(403).json({ message: 'Acceso prohibido. Permiso insuficiente.' });
      }
    };
  };
  
  module.exports = { isAdmin, hasPermission };