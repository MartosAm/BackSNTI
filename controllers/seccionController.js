const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

// Crear Sección
const crearSeccion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre_seccion, descripcion } = req.body;

    const nuevaSeccion = await prisma.secciones.create({
      data: {
        nombre_seccion,
        descripcion: descripcion || null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Sección creada exitosamente',
      data: nuevaSeccion
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear sección',
      error: error.message
    });
  }
};

// Obtener Sección por ID
const getSeccionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const seccionId = parseInt(id);

    if (isNaN(seccionId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de sección inválido' 
      });
    }

    const seccion = await prisma.secciones.findUnique({
      where: { id_seccion: seccionId }
    });

    if (!seccion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sección no encontrada' 
      });
    }

    return res.status(200).json({
      success: true,
      data: seccion
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener sección',
      error: error.message
    });
  }
};

module.exports = { crearSeccion, getSeccionPorId };