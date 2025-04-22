// middleware/index.js
const auth = require('./auth');
const authorization = require('./authorization');
const errorHandler = require('./error-handler');

module.exports = {
  authMiddleware: auth,
  verifyToken: auth.verifyToken, // ✅ AÑADIR esta línea correctamente
  authorizationMiddleware: authorization,
  errorHandler


  
};