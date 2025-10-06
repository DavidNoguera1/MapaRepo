const express = require('express');
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../../controllers/userControllers/adminUserController');
const { authenticateToken } = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(authenticateToken);
router.use(isAdmin);

// Listar usuarios con filtros y paginación
router.get('/users', listUsers);

// Obtener usuario por ID
router.get('/users/:id', getUserById);

// Crear usuario
router.post('/users', createUser);

// Actualizar usuario por ID
router.put('/users/:id', updateUser);

// Eliminar usuario por ID
router.delete('/users/:id', deleteUser);

module.exports = router;
