// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { PrismaClient } = require('@prisma/client');
const { errorHandler } = require('./middleware');
const routes = require('./routes');

// Inicializar app y prisma
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de SNTI',
      version: '1.0.0',
      description: 'Documentación de la API del Sistema Nacional de Trabajadores INPI',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'desarrollo@ejemplo.com', // Reemplaza con tu email
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./controllers/*.js', './routes/*.js'], // Archivos a escanear
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware globales
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

// Rutas de la API
app.use('/api', routes);

// Ruta base (opcional, si es necesario)
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Servidor SNTI corriendo! 🚀' });
});

// Manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);

  try {
    await prisma.$connect();
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
  }
});

// Manejar cierre limpio
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Conexión a la base de datos cerrada');
  process.exit(0);
});