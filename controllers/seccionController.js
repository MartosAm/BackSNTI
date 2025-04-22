// controllers/seccionController.js
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();


const crearSeccion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre_seccion, descripcion } = req.body;

    // Usar SELECT porque es una función
    const nuevaSeccion = await prisma.$queryRaw`
      SELECT * FROM sp_insertar_seccion(${nombre_seccion}, ${descripcion})
    `;

    return res.status(201).json({
      success: true,
      message: nuevaSeccion[0]?.mensaje || 'Sección creada',
      data: nuevaSeccion[0]
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de base de datos',
      error: error.message
    });
  }
};

//METODO GET DE SECCIONES POR ID
// controllers/seccionController.js


/**
 * @swagger
 * /api/secciones/{id}:
 *   get:
 *     summary: Obtener una sección por ID
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Sección encontrada
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error de servidor
 */
// controllers/seccionController.js


/**
 * Obtener una sección por su ID
 * @param {object} req - Objeto de solicitud de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función siguiente de Express
 */
const getSeccionPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el ID sea un número válido
    const seccionId = parseInt(id);
    if (isNaN(seccionId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El ID de la sección debe ser un número válido' 
      });
    }
    
    // Consultar la sección en la base de datos usando Prisma
    const seccion = await prisma.$queryRaw`SELECT * FROM secciones WHERE id_seccion = ${seccionId}`;
    
    // Verificar si se encontró la sección
    if (!seccion || seccion.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sección no encontrada' 
      });
    }
    
    // Devolver la sección encontrada
    return res.status(200).json({
      success: true,
      data: seccion[0]
    });
    
  } catch (error) {
    next(error);
  }
};



/*METODO DELETE PARA EL ENDPOINT Y SU FUNCION

*/

/**
 * @swagger
 * tags:
 *   name: Trabajadores
 *   description: Gestión de trabajadores
 */

/**
 * @swagger
 * /trabajadores/{id}:
 *   delete:
 *     summary: Elimina un trabajador por ID
 *     tags: [Trabajadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador a eliminar
 *     responses:
 *       200:
 *         description: Trabajador eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error del servidor
 */
const eliminarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si existe el trabajador
    const trabajadorExistente = await prisma.trabajadores.findUnique({
      where: { id_trabajador: Number(id) }
    });

    if (!trabajadorExistente) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }

    // Eliminar trabajador
    await prisma.trabajadores.delete({
      where: { id_trabajador: Number(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Trabajador eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar trabajador',
      error: error.message
    });
  }
};


// Exportar todas las funciones juntas
module.exports = {
  crearSeccion,
  getSeccionPorId,
  eliminarTrabajador
};

