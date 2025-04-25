// File: controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

const crearUsuario = async (req, res) => {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array(),
        });
    }

    const { id_trabajador, identificador, contraseña, rol = 'Empleado' } = req.body;

    try {
        // Check if Prisma is properly initialized and the model exists
        if (typeof prisma.usuarios !== 'object' && typeof prisma.usuarios !== 'function') {
            console.error('Modelo "usuarios" no disponible o mal inicializado');
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor',
                error: 'Modelo usuarios no disponible en Prisma client',
            });
        }

        // Check if the identifier or worker ID already exists
        const existente = await prisma.usuarios.findFirst({
            where: {
                OR: [
                    { identificador },
                    id_trabajador ? { id_trabajador } : {},
                ],
            },
        });

        if (existente) {
            return res.status(409).json({
                success: false,
                message: 'El identificador o el ID del trabajador ya están en uso.',
            });
        }

        // Hash the password
        const saltRounds = 10;
        const contraseña_hash = await bcrypt.hash(contraseña, saltRounds);

        // Try using the stored procedure
        try {
            await prisma.$executeRaw`
                CALL public.sp_insertar_usuario(${id_trabajador || null}, ${identificador}, ${contraseña_hash}, ${rol});
            `;
        } catch (procError) {
            console.error('Error al llamar al procedimiento almacenado:', procError);

            // Fallback to direct insert if the stored procedure fails
            const nuevoUsuario = await prisma.usuarios.create({
                data: {
                    id_trabajador: id_trabajador || null,
                    identificador,
                    contraseña_hash, // Note: the field name in the schema is contraseña_hash, not contraseña
                    intentos_fallidos: 0,
                    bloqueado: false,
                    fecha_creacion: new Date(),
                    ultimo_login: null,
                    ultimo_cambio_password: new Date(),
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente (inserción directa)',
                data: {
                    ...nuevoUsuario,
                    contraseña_hash: undefined, // Don't return the hashed password
                },
            });
        }

        // Get the newly inserted user
        const nuevoUsuario = await prisma.usuarios.findUnique({
            where: { identificador },
        });

        if (!nuevoUsuario) {
            return res.status(500).json({
                success: false,
                message: 'Error: El usuario fue creado pero no puede ser recuperado',
            });
        }

        // Return the new user without the password
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                ...nuevoUsuario,
                contraseña_hash: undefined, // Don't return the hashed password
            },
        });

    } catch (error) {
        console.error('Error al crear el usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error del servidor',
            error: error.message,
        });
    }
};

const loginUsuario = async (req, res) => {
    const { identificador, contraseña } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Error de validación', errors: errors.array() });
        }

        const [usuario] = await prisma.$queryRaw`
            SELECT * FROM sp_login_usuario(${identificador});
        `;

        if (!usuario) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña_hash);

        if (!contraseñaValida) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const tokenPayload = {
            id: usuario.id_usuario,
            identificador: usuario.identificador,
            rol: usuario.rol,
        };

        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

        await prisma.usuarios.update({
            where: { id_usuario: usuario.id_usuario },
            data: { ultimo_login: new Date() },
        });

        return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', token });

    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        return res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
    }
};

module.exports = {
    crearUsuario,
    loginUsuario,

};