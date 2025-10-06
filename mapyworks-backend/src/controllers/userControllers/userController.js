const User = require('../../models/User');

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.is_active) {
      return res.status(404).json({ error: 'Cuenta de usuario desactivada' });
    }

    // Excluir datos sensibles
    const userResponse = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      phone: user.phone,
      cedula: user.cedula,
      profile_picture_url: user.profile_picture_url,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({ user: userResponse });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const { user_name, email, phone, cedula, profile_picture_url } = req.body;

    // Validaciones básicas
    if (!user_name) {
      return res.status(400).json({ error: 'El nombre de usuario es requerido' });
    }

    // Verificar si la nueva cédula ya existe (si se proporciona y es diferente)
    if (cedula) {
      const existingUser = await User.findByCedula(cedula);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(409).json({ error: 'La cédula ya está registrada' });
      }
    }

    // Actualizar usuario
    const updatedUser = await User.update(req.userId, {
      user_name,
      email,
      phone,
      cedula,
      profile_picture_url
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Respuesta exitosa
    const userResponse = {
      id: updatedUser.id,
      user_name: updatedUser.user_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      cedula: updatedUser.cedula,
      profile_picture_url: updatedUser.profile_picture_url,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Eliminar cuenta (soft delete)
const deleteAccount = async (req, res) => {
  try {
    const deletedUser = await User.softDelete(req.userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Cuenta eliminada exitosamente',
      user_id: deletedUser.id
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar contraseña
const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'La contraseña actual y la nueva contraseña son requeridas' });
    }

    // Obtener usuario y verificar contraseña actual
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isCurrentPasswordValid = await User.verifyPassword(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Actualizar contraseña
    await User.updatePassword(req.userId, new_password);

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar usuario (solo para admins)
const deleteUser = async (req, res) => {
  try {
    // Verificar que el usuario autenticado sea admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden eliminar usuarios.' });
    }

    const userIdToDelete = req.params.id;

    // No permitir que un admin se elimine a sí mismo
    if (req.userId === userIdToDelete) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
    }

    // Verificar que el usuario a eliminar existe
    const userToDelete = await User.findById(userIdToDelete);
    if (!userToDelete) {
      return res.status(404).json({ error: 'Usuario a eliminar no encontrado.' });
    }

    // Eliminar permanentemente (hard delete)
    const deletedUser = await User.hardDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Error al eliminar el usuario.' });
    }

    res.json({
      message: 'Usuario eliminado exitosamente.',
      deleted_user_id: deletedUser.id,
      deleted_user_email: deletedUser.email
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  updatePassword,
  deleteUser
};
