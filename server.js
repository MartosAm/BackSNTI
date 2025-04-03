require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { PrismaClient } = require('@prisma/client');
const trabajadorRoutes = require('./routes/trabajadorRoutes');
const routes = require('./routes'); // Importar rutas desde index.js


app.use('/api/trabajadores', trabajadorRoutes);

// Inicializar Express
const app = express();
const prisma = new PrismaClient();

// Middleware globales
app.use(cors()); // Habilitar CORS
app.use(helmet()); // Seguridad HTTP
app.use(morgan("dev")); // Logs de peticiones
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Manejo de formularios

// Rutas principales
app.use("/api", routes, );

// Ruta base
app.get("/", (req, res) => {
  res.json({ mensaje: "¡Servidor SNTI corriendo! 🚀" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await prisma.$connect(); // Conectar a BD
    console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    process.exit(1);
  }
});
