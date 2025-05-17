
// controllers/hijosController.js
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises; // Añadido módulo fs.promises
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();
const { TIPOS_DOCUMENTOS, MAPEO_TIPOS_DOCUMENTOS } = require('../config/multerConfig');

/**
 * Controlador para registrar un nuevo hijo de un trabajador y subir su acta de nacimiento
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con el resultado de la operación
 */
const registrarHijo = async (req, res) => {
    try {
        // Validar entrada usando express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Extraer datos del formulario
        const {
            id_trabajador,
            nombre,
            apellido_paterno,
            apellido_materno,
            fecha_nacimiento
        } = req.body;

        // Verificar archivo de acta de nacimiento
        const archivo = req.file;
        if (!archivo) {
            return res.status(400).json({
                success: false,
                message: 'El acta de nacimiento es requerida'
            });
        }

        // Verificar datos requeridos
        if (!id_trabajador || !nombre || !apellido_paterno || !apellido_materno || !fecha_nacimiento) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        let hashArchivo;
        try {
            const archivoBuffer = await fs.readFile(archivo.path);
            hashArchivo = crypto.createHash('sha256').update(archivoBuffer).digest('hex');
        } catch (error) {
            console.error('Error al leer el archivo para calcular el hash:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al procesar el archivo'
            });
        }

        // Crear registro en tabla documentos
        const documento = await prisma.documentos.create({
            data: {
                id_trabajador: parseInt(id_trabajador),
                tipo_documento: TIPOS_DOCUMENTOS.ACTA_NACIMIENTO, // Usa la constante específica
                nombre_archivo: archivo.originalname,
                hash_archivo: hashArchivo,
                descripcion: `Acta de nacimiento de ${nombre} ${apellido_paterno} ${apellido_materno}`,
                tipo_archivo: path.extname(archivo.originalname).substring(1),
                ruta_almacenamiento: path.join(TIPOS_DOCUMENTOS.ACTA_NACIMIENTO, archivo.filename),
                tamano_bytes: BigInt(archivo.size),
                es_publico: false,
                mimetype: archivo.mimetype,
                metadata: {
                    relacion: "hijo",
                    tipo: "acta_nacimiento"
                }
            }
        });

        // Registrar al hijo con relación al documento
        const hijo = await prisma.hijos.create({
            data: {
                id_trabajador: parseInt(id_trabajador),
                nombre,
                apellido_paterno,
                apellido_materno,
                fecha_nacimiento: new Date(fecha_nacimiento),
                acta_nacimiento_id: documento.id_documento,
                vigente: true
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Hijo registrado exitosamente',
            data: {
                hijo,
                documento: {
                    id: documento.id_documento,
                    nombre_archivo: documento.nombre_archivo,
                    tipo: documento.tipo_documento
                }
            }
        });

    } catch (error) {
        console.error('Error en registrarHijo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al registrar hijo',
            error: error.message
        });
    }
};














/**
 * Controlador para obtener la lista de hijos de un trabajador
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con la lista de hijos
 */
const obtenerHijosPorTrabajador = async (req, res) => {
  try {
    const { id_trabajador } = req.params;
    
    if (!id_trabajador) {
      return res.status(400).json({
        success: false,
        message: 'El ID del trabajador es requerido'
      });
    }

    const hijos = await prisma.hijos.findMany({
      where: {
        id_trabajador: parseInt(id_trabajador),
        vigente: true
      },
      include: {
        documentos: {
          select: {
            id_documento: true,
            nombre_archivo: true,
            tipo_documento: true,
            fecha_subida: true,
            ruta_almacenamiento: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: hijos
    });

  } catch (error) {
    console.error('Error en obtenerHijosPorTrabajador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener hijos',
      error: error.message
    });
  }
};

/**
 * Controlador para actualizar información de un hijo
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con el resultado de la operación
 */


const actualizarHijo = async (req, res) => {
  try {
    const { id_hijo } = req.params;
    const { 
      nombre, 
      apellido_paterno, 
      apellido_materno, 
      fecha_nacimiento,
      vigente
    } = req.body;

    // Validar datos
    if (!id_hijo) {
      return res.status(400).json({
        success: false,
        message: 'El ID del hijo es requerido'
      });
    }

    // Verificar si el hijo existe
    const hijoExistente = await prisma.hijos.findUnique({
      where: { id_hijo: parseInt(id_hijo) }
    });

    if (!hijoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Hijo no encontrado'
      });
    }

    // Preparar datos para actualización
    const datosActualizacion = {};
    
    if (nombre) datosActualizacion.nombre = nombre;
    if (apellido_paterno) datosActualizacion.apellido_paterno = apellido_paterno;
    if (apellido_materno) datosActualizacion.apellido_materno = apellido_materno;
    if (fecha_nacimiento) datosActualizacion.fecha_nacimiento = new Date(fecha_nacimiento);
    if (vigente !== undefined) datosActualizacion.vigente = vigente;

    // Actualizar el registro del hijo
    const hijoActualizado = await prisma.hijos.update({
      where: { id_hijo: parseInt(id_hijo) },
      data: datosActualizacion
    });

    // Verificar si hay un nuevo documento de acta de nacimiento
    if (req.file) {
      const archivo = req.file;
      
      // Calcular hash del archivo para validación e integridad
      const hashArchivo = crypto
        .createHash('sha256')
        .update(archivo.buffer || archivo.path)
        .digest('hex');

      // Crear nuevo registro de documento
      const nuevoDocumento = await prisma.documentos.create({
        data: {
          id_trabajador: hijoExistente.id_trabajador,
          tipo_documento: TIPOS_DOCUMENTOS.ACTA_NACIMIENTO,
          nombre_archivo: archivo.originalname,
          hash_archivo: hashArchivo,
          descripcion: `Acta de nacimiento actualizada de ${hijoActualizado.nombre} ${hijoActualizado.apellido_paterno} ${hijoActualizado.apellido_materno}`,
          tipo_archivo: path.extname(archivo.originalname).substring(1),
          ruta_almacenamiento: path.join(TIPOS_DOCUMENTOS.ACTA_NACIMIENTO, archivo.filename),
          tamano_bytes: BigInt(archivo.size),
          es_publico: false,
          mimetype: archivo.mimetype,
          metadata: {
            relacion: "hijo",
            tipo: "acta_nacimiento",
            actualizacion: true
          }
        }
      });

      // Actualizar la referencia del documento en el hijo
      await prisma.hijos.update({
        where: { id_hijo: parseInt(id_hijo) },
        data: {
          acta_nacimiento_id: nuevoDocumento.id_documento
        }
      });
      
      // Incluir información del nuevo documento en la respuesta
      return res.status(200).json({
        success: true,
        message: 'Información y documento del hijo actualizados exitosamente',
        data: {
          hijo: hijoActualizado,
          documento: {
            id: nuevoDocumento.id_documento,
            nombre_archivo: nuevoDocumento.nombre_archivo
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Información del hijo actualizada exitosamente',
      data: hijoActualizado
    });

  } catch (error) {
    console.error('Error en actualizarHijo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar hijo',
      error: error.message
    });
  }
};







/**
 * Controlador para eliminar un hijo PERMANENTEMENTE
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con el resultado de la operación
 */
const eliminarHijo = async (req, res) => {
    try {
        const { id_hijo } = req.params;

        if (!id_hijo) {
            return res.status(400).json({
                success: false,
                message: 'El ID del hijo es requerido'
            });
        }

        // Verificar si el hijo existe
        const hijoExistente = await prisma.hijos.findUnique({
            where: { id_hijo: parseInt(id_hijo) }
        });

        if (!hijoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Hijo no encontrado'
            });
        }

        // Eliminar el hijo PERMANENTEMENTE
        const hijoEliminado = await prisma.hijos.delete({
            where: { id_hijo: parseInt(id_hijo) }
        });

        return res.status(200).json({
            success: true,
            message: 'Hijo eliminado permanentemente exitosamente',
            data: hijoEliminado
        });

    } catch (error) {
        console.error('Error en eliminarHijo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar hijo permanentemente',
            error: error.message
        });
    }
};

module.exports = {
  registrarHijo,
  obtenerHijosPorTrabajador,
  actualizarHijo,
  eliminarHijo
};