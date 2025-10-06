const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe en la base de datos
    const query = 'SELECT id, is_active, role FROM users WHERE id = $1';
    const result = await pool.query(query, [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'El usuario ya no existe' });
    }

    if (!result.rows[0].is_active) {
      return res.status(401).json({ error: 'Cuenta de usuario desactivada' });
    }

    // Añadir user ID y role al request para uso en controllers
    req.userId = decoded.userId;
    req.userRole = result.rows[0].role; // Añadir role también
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Failed to authenticate token' });
  }
};

module.exports = { authenticateToken };