// controllers/trabajadorController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Función para validar formato de CURP
const validarCURP = (curp) => {
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
  return regex.test(curp);
};

// Función para validar formato de RFC
const validarRFC = (rfc) => {
  const regex = /^[A-Z]{4}\d{6}[0-9A-Z]{3}$/;
  return regex.test(rfc);
};

// Función para validar formato de email
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

exports.crearTrabajador = async (req, res) => {
  try {
    const {
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, rfc, 
      email, situacion_sentimental, numero_hijos, numero_empleado, numero_plaza, 
      fecha_ingreso, fecha_ingreso_gobierno, nivel_puesto, nombre_puesto, puesto_inpi, 
      adscripcion, id_seccion, nivel_estudios, institucion_estudios, certificado_estudios, 
      plaza_base
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido_paterno || !fecha_nacimiento || !sexo || !curp || !rfc || 
        !email || !numero_empleado || !numero_plaza || !fecha_ingreso || !fecha_ingreso_gobierno || 
        !nivel_puesto || !nombre_puesto || !adscripcion || !id_seccion) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios para crear un trabajador' 
      });
    }

    // Validaciones de formato
    if (!validarCURP(curp)) {
      return res.status(400).json({ error: 'Formato de CURP no válido' });
    }

    if (!validarRFC(rfc)) {
      return res.status(400).json({ error: 'Formato de RFC no válido' });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ error: 'Formato de email no válido' });
    }

    // Validar que sexo y situacion_sentimental cumplan con los valores de dominio
    const sexos_validos = ['MASCULINO', 'FEMENINO', 'OTRO']; // Ajusta según tus valores de dominio
    if (!sexos_validos.includes(sexo.toUpperCase())) {
      return res.status(400).json({ error: 'Valor de sexo no válido' });
    }

    if (situacion_sentimental) {
      const situaciones_validas = ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION LIBRE']; // Ajusta según tus valores de dominio
      if (!situaciones_validas.includes(situacion_sentimental.toUpperCase())) {
        return res.status(400).json({ error: 'Valor de situación sentimental no válido' });
      }
    }

    // Verificar si ya existe un trabajador con los mismos datos únicos
    const trabajadorExistente = await prisma.trabajador.findFirst({
      where: {
        OR: [
          { curp },
          { rfc },
          { email },
          { numero_empleado },
          { numero_plaza }
        ]
      },
      select: {
        curp: true,
        rfc: true,
        email: true,
        numero_empleado: true,
        numero_plaza: true
      }
    });

    if (trabajadorExistente) {
      // Determinar qué campo único está duplicado
      let camposDuplicados = [];
      if (trabajadorExistente.curp === curp) camposDuplicados.push('CURP');
      if (trabajadorExistente.rfc === rfc) camposDuplicados.push('RFC');
      if (trabajadorExistente.email === email) camposDuplicados.push('Email');
      if (trabajadorExistente.numero_empleado === numero_empleado) camposDuplicados.push('Número de empleado');
      if (trabajadorExistente.numero_plaza === numero_plaza) camposDuplicados.push('Número de plaza');

      return res.status(409).json({ 
        error: `Ya existe un trabajador con los siguientes datos: ${camposDuplicados.join(', ')}` 
      });
    }

    // Convertir fechas de string a objetos Date
    const parseFecha = (fechaString) => {
      if (!fechaString) return null;
      return new Date(fechaString);
    };

    // Crear el trabajador
    const nuevoTrabajador = await prisma.trabajador.create({
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento: parseFecha(fecha_nacimiento),
        sexo,
        curp,
        rfc,
        email,
        situacion_sentimental,
        numero_hijos: parseInt(numero_hijos) || 0,
        numero_empleado,
        numero_plaza,
        fecha_ingreso: parseFecha(fecha_ingreso),
        fecha_ingreso_gobierno: parseFecha(fecha_ingreso_gobierno),
        nivel_puesto,
        nombre_puesto,
        puesto_inpi,
        adscripcion,
        id_seccion: parseInt(id_seccion),
        nivel_estudios,
        institucion_estudios,
        certificado_estudios: certificado_estudios === true,
        plaza_base
      }
    });

    res.status(201).json({
      message: 'Trabajador creado exitosamente',
      trabajador: {
        id_trabajador: nuevoTrabajador.id_trabajador,
        nombre: nuevoTrabajador.nombre,
        apellido_paterno: nuevoTrabajador.apellido_paterno,
        apellido_materno: nuevoTrabajador.apellido_materno,
        curp: nuevoTrabajador.curp,
        numero_empleado: nuevoTrabajador.numero_empleado
      }
    });

  } catch (error) {
    console.error('Error al crear trabajador:', error);
    res.status(500).json({ 
      error: 'Error al crear trabajador', 
      details: error.message 
    });
  }
};

// Obtener todos los trabajadores con paginación
exports.obtenerTrabajadores = async (req, res) => {
  try {
    const { page = 1, size = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(size);
    const take = parseInt(size);

    // Construir el filtro de búsqueda
    let where = {};
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido_paterno: { contains: search, mode: 'insensitive' } },
          { apellido_materno: { contains: search, mode: 'insensitive' } },
          { curp: { contains: search, mode: 'insensitive' } },
          { rfc: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { numero_empleado: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Obtener el total de registros
    const total = await prisma.trabajador.count({ where });
    
    // Obtener los trabajadores con paginación
    const trabajadores = await prisma.trabajador.findMany({
      where,
      skip,
      take,
      orderBy: {
        apellido_paterno: 'asc'
      },
      select: {
        id_trabajador: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        curp: true,
        rfc: true,
        email: true,
        numero_empleado: true,
        numero_plaza: true,
        fecha_ingreso: true,
        nivel_puesto: true,
        nombre_puesto: true,
        adscripcion: true
      }
    });

    res.json({
      total,
      page: parseInt(page),
      size: parseInt(size),
      data: trabajadores,
      totalPages: Math.ceil(total / take)
    });

  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    res.status(500).json({ 
      error: 'Error al obtener trabajadores', 
      details: error.message 
    });
  }
};

// Obtener un trabajador por ID
exports.obtenerTrabajadorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trabajador = await prisma.trabajador.findUnique({
      where: {
        id_trabajador: parseInt(id)
      }
    });

    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json(trabajador);

  } catch (error) {
    console.error('Error al obtener trabajador:', error);
    res.status(500).json({ 
      error: 'Error al obtener trabajador', 
      details: error.message 
    });
  }
};

// Actualizar un trabajador
exports.actualizarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, rfc, 
      email, situacion_sentimental, numero_hijos, numero_empleado, numero_plaza, 
      fecha_ingreso, fecha_ingreso_gobierno, nivel_puesto, nombre_puesto, puesto_inpi, 
      adscripcion, id_seccion, nivel_estudios, institucion_estudios, certificado_estudios, 
      plaza_base
    } = req.body;

    // Verificar si el trabajador existe
    const trabajadorExistente = await prisma.trabajador.findUnique({
      where: {
        id_trabajador: parseInt(id)
      }
    });

    if (!trabajadorExistente) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    // Verificar duplicados en campos únicos (solo si los campos han cambiado)
    if (curp !== trabajadorExistente.curp || 
        rfc !== trabajadorExistente.rfc || 
        email !== trabajadorExistente.email ||
        numero_empleado !== trabajadorExistente.numero_empleado ||
        numero_plaza !== trabajadorExistente.numero_plaza) {
      
      const duplicados = await prisma.trabajador.findFirst({
        where: {
          id_trabajador: { not: parseInt(id) },
          OR: [
            curp ? { curp } : {},
            rfc ? { rfc } : {},
            email ? { email } : {},
            numero_empleado ? { numero_empleado } : {},
            numero_plaza ? { numero_plaza } : {}
          ]
        },
        select: {
          curp: true,
          rfc: true,
          email: true,
          numero_empleado: true,
          numero_plaza: true
        }
      });

      if (duplicados) {
        // Determinar qué campo único está duplicado
        let camposDuplicados = [];
        if (duplicados.curp === curp) camposDuplicados.push('CURP');
        if (duplicados.rfc === rfc) camposDuplicados.push('RFC');
        if (duplicados.email === email) camposDuplicados.push('Email');
        if (duplicados.numero_empleado === numero_empleado) camposDuplicados.push('Número de empleado');
        if (duplicados.numero_plaza === numero_plaza) camposDuplicados.push('Número de plaza');

        return res.status(409).json({ 
          error: `Ya existe un trabajador con los siguientes datos: ${camposDuplicados.join(', ')}` 
        });
      }
    }

    // Convertir fechas de string a objetos Date
    const parseFecha = (fechaString) => {
      if (!fechaString) return undefined;
      return new Date(fechaString);
    };

    // Preparar los datos para actualizar (solo los campos que se reciben)
    let dataToUpdate = {};
    
    if (nombre !== undefined) dataToUpdate.nombre = nombre;
    if (apellido_paterno !== undefined) dataToUpdate.apellido_paterno = apellido_paterno;
    if (apellido_materno !== undefined) dataToUpdate.apellido_materno = apellido_materno;
    if (fecha_nacimiento !== undefined) dataToUpdate.fecha_nacimiento = parseFecha(fecha_nacimiento);
    if (sexo !== undefined) dataToUpdate.sexo = sexo;
    if (curp !== undefined) dataToUpdate.curp = curp;
    if (rfc !== undefined) dataToUpdate.rfc = rfc;
    if (email !== undefined) dataToUpdate.email = email;
    if (situacion_sentimental !== undefined) dataToUpdate.situacion_sentimental = situacion_sentimental;
    if (numero_hijos !== undefined) dataToUpdate.numero_hijos = parseInt(numero_hijos);
    if (numero_empleado !== undefined) dataToUpdate.numero_empleado = numero_empleado;
    if (numero_plaza !== undefined) dataToUpdate.numero_plaza = numero_plaza;
    if (fecha_ingreso !== undefined) dataToUpdate.fecha_ingreso = parseFecha(fecha_ingreso);
    if (fecha_ingreso_gobierno !== undefined) dataToUpdate.fecha_ingreso_gobierno = parseFecha(fecha_ingreso_gobierno);
    if (nivel_puesto !== undefined) dataToUpdate.nivel_puesto = nivel_puesto;
    if (nombre_puesto !== undefined) dataToUpdate.nombre_puesto = nombre_puesto;
    if (puesto_inpi !== undefined) dataToUpdate.puesto_inpi = puesto_inpi;
    if (adscripcion !== undefined) dataToUpdate.adscripcion = adscripcion;
    if (id_seccion !== undefined) dataToUpdate.id_seccion = parseInt(id_seccion);
    if (nivel_estudios !== undefined) dataToUpdate.nivel_estudios = nivel_estudios;
    if (institucion_estudios !== undefined) dataToUpdate.institucion_estudios = institucion_estudios;
    if (certificado_estudios !== undefined) dataToUpdate.certificado_estudios = certificado_estudios === true;
    if (plaza_base !== undefined) dataToUpdate.plaza_base = plaza_base;

    // Actualizar la fecha de actualización
    dataToUpdate.fecha_actualizacion = new Date();

    // Actualizar el trabajador
    const trabajadorActualizado = await prisma.trabajador.update({
      where: {
        id_trabajador: parseInt(id)
      },
      data: dataToUpdate
    });

    res.json({
      message: 'Trabajador actualizado exitosamente',
      trabajador: trabajadorActualizado
    });

  } catch (error) {
    console.error('Error al actualizar trabajador:', error);
    res.status(500).json({ 
      error: 'Error al actualizar trabajador', 
      details: error.message 
    });
  }
};

// Eliminar un trabajador
exports.eliminarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el trabajador existe
    const trabajadorExistente = await prisma.trabajador.findUnique({
      where: {
        id_trabajador: parseInt(id)
      }
    });

    if (!trabajadorExistente) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    // Eliminar el trabajador
    await prisma.trabajador.delete({
      where: {
        id_trabajador: parseInt(id)
      }
    });

    res.json({
      message: 'Trabajador eliminado exitosamente',
      id: parseInt(id)
    });

  } catch (error) {
    console.error('Error al eliminar trabajador:', error);
    res.status(500).json({ 
      error: 'Error al eliminar trabajador', 
      details: error.message 
    });
  }
};
