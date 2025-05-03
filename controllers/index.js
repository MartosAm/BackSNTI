// controllers/index.js


import { PrismaClient } from '@prisma/client';  
import trabajadorController from './trabajadorController';
import documentoController from './documentoController';
import userController from './userController'; 
import seccionController from './seccionController';

module.exports = {
  trabajadorController,
  userController,
  seccionController,
  documentoController
};