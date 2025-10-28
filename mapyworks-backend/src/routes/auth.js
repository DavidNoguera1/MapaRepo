const express = require('express');
const { register, login, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Registrar nuevo usuario
router.post('/register', register);

// Login de usuario
router.post('/login', login);

// Reset password using cedula
router.post('/reset-password', resetPassword);

module.exports = router;
