const auth = require('./auth');
const { isAdmin, hasPermission } = require('./authorization');
const errorHandler = require('./error-handler');

module.exports = { auth, isAdmin, hasPermission, errorHandler };