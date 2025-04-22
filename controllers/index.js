// controllers/index.js

const trabajadorController = require('./trabajadorController');
const userController = require('./userController');
// Si tienes un seccionController, asegúrate de que la ruta sea correcta
const seccionController = require('./seccionController');


module.exports = {
  trabajadorController,
  userController,
  seccionController
};