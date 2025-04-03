// middleware/index.js
const auth = require('./auth');
const authorization = require('./authorization');
const errorHandler = require('./error-handler');

module.exports = {
  auth,
  authorization,
  errorHandler
};