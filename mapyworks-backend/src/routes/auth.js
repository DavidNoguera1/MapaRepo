const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Registrar nuevo usuario
router.post('/register', register);

// Login de usuario
router.post('/login', login);


module.exports = router;