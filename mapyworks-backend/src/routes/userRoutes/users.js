const express = require('express');
const User = require('../../models/User');
const {
  getProfile,
  updateProfile,
  deleteAccount,
  updatePassword,
  deleteUser
} = require('../../controllers/userControllers/userController');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener perfil del usuario autenticado
router.get('/me', getProfile);

// Actualizar perfil del usuario
router.put('/me', updateProfile);

// Eliminar cuenta (soft delete)
router.delete('/me', deleteAccount);

// Actualizar contraseña
router.put('/me/password', updatePassword);

// Eliminar usuario por ID (solo para admins)
router.delete('/:id', deleteUser);

// Buscar usuarios por nombre (para usuarios y admin)
router.get('/search', async (req, res) => {
  try {
    const { name, limit = 10, offset = 0 } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'El parámetro name es requerido' });
    }

    const users = await User.findByName(name, parseInt(limit), parseInt(offset));

    res.json({
      total: users.length, // Para búsqueda simple, devolver la cantidad encontrada
      limit: parseInt(limit),
      offset: parseInt(offset),
      users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
