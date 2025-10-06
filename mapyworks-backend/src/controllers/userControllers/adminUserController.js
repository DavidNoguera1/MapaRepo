const User = require('../../models/User');

// Listar usuarios con filtros y paginación (admin)
const listUsers = async (req, res) => {
  try {
    const {
      user_name,
      email,
      cedula,
      phone,
      role,
      is_active,
      created_after,
      created_before,
      sort = 'desc',
      limit = 10,
      offset = 0
    } = req.query;

    const filters = {
      user_name,
      email,
      cedula,
      phone,
      role,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      created_after,
      created_before
    };

    const users = await User.findByFilters(filters, parseInt(limit), parseInt(offset), sort);
    const total = await User.count(filters);

    res.json({
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      users
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuario por ID (admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear usuario (admin)
const createUser = async (req, res) => {
  try {
    const { user_name, email, password, phone, cedula, role } = req.body;

    if (!user_name || !email || !password) {
      return res.status(400).json({ error: 'user_name, email y password son requeridos' });
    }

    if (await User.emailExists(email)) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    if (cedula && await User.cedulaExists(cedula)) {
      return res.status(409).json({ error: 'La cédula ya está registrada' });
    }

    const newUser = await User.create({ user_name, email, password, phone, cedula, role });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar usuario por ID (admin)
const updateUser = async (req, res) => {
  try {
    const { user_name, email, phone, cedula, profile_picture_url, role, is_active } = req.body;

    const updateData = { user_name, email, phone, cedula, profile_picture_url };

    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Validar que el email no esté duplicado si se está actualizando
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(409).json({ error: 'El email ya está registrado por otro usuario' });
      }
    }

    const updatedUser = await User.update(req.params.id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar usuario por ID (admin)
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.hardDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario eliminado exitosamente',
      deleted_user_id: deletedUser.id,
      deleted_user_email: deletedUser.email
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
