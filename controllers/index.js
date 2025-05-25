// controllers/index.js


import trabajadorController from './trabajadorController';
import documentoController from './documentoController';
import userController from './userController'; 
import seccionController from './seccionController';
import hijosController from './hijosController'; // Ajusta la ruta si es necesario
import authController from './authController'; // Ajusta la ruta si es necesario
import bootstrapController from './bootstrapController'; // Ajusta la ruta si es necesario

module.exports = {
  trabajadorController,
  userController,
  seccionController,
  documentoController,
  hijosController,
  authController,
  bootstrapController
};