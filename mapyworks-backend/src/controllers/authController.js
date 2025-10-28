const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { user_name, email, password, phone, cedula } = req.body;

    // Validaciones básicas
    if (!user_name || !email || !password) {
      return res.status(400).json({
        error: 'El nombre de usuario, email y contraseña son requeridos'
      });
    }

    // Verificar si el email ya existe
    if (await User.emailExists(email)) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Verificar si la cédula ya existe (si se proporciona)
    if (cedula && await User.cedulaExists(cedula)) {
      return res.status(409).json({ error: 'La cédula ya está registrada' });
    }

    // Crear usuario
    const newUser = await User.create({
      user_name,
      email,
      password,
      phone,
      cedula
    });

    // Generar token
    const token = generateToken(newUser.id);

    // Respuesta exitosa (excluir datos sensibles)
    const userResponse = {
      id: newUser.id,
      user_name: newUser.user_name,
      email: newUser.email,
      phone: newUser.phone,
      cedula: newUser.cedula,
      role: newUser.role,
      created_at: newUser.created_at
    };

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error interno del servidor durante el registro' });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si usuario está activo
    if (!user.is_active) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }

    // Verificar contraseña
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user.id);

    // Respuesta exitosa (excluir datos sensibles)
    const userResponse = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      phone: user.phone,
      cedula: user.cedula,
      profile_picture_url: user.profile_picture_url,
      role: user.role,
      created_at: user.created_at
    };

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor durante el inicio de sesión' });
  }
};

// Reset password using cedula
const resetPassword = async (req, res) => {
  try {
    const { cedula1, cedula2, newPassword } = req.body;

    // Validaciones básicas
    if (!cedula1 || !cedula2 || !newPassword) {
      return res.status(400).json({ error: 'Cédula y nueva contraseña son requeridas' });
    }

    if (cedula1 !== cedula2) {
      return res.status(400).json({ error: 'Los números de cédula no coinciden' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar usuario por cédula
    const user = await User.findByCedula(cedula1);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado con esa cédula' });
    }

    // Verificar si usuario está activo
    if (!user.is_active) {
      return res.status(400).json({ error: 'Cuenta desactivada' });
    }

    // Actualizar contraseña
    await User.updatePassword(user.id, newPassword);

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error interno del servidor al resetear la contraseña' });
  }
};

module.exports = {
  register,
  login,
  resetPassword
};
