const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes/users'); // ← Nueva ruta
const adminRoutes = require('./routes/userRoutes/adminUser'); // ← Nueva ruta
const profileImageRoutes = require('./routes/userRoutes/profileImages'); // ← Nueva ruta para imágenes de perfil
const serviceRoutes = require('./routes/serviceRoutes/services'); // ← Nueva ruta
const tagsRoutes = require('./routes/tags'); // ← Nueva ruta
const reviewsRoutes = require('./routes/serviceRoutes/reviews'); // ← Nueva ruta
const serviceContactsRoutes = require('./routes/serviceRoutes/serviceContacts'); // ← Nueva ruta
const serviceCoversRoutes = require('./routes/serviceRoutes/serviceCovers'); // ← Nueva ruta para service covers
const servicePhotosRoutes = require('./routes/serviceRoutes/servicePhotos'); // ← Nueva ruta para service photos
const chatsRoutes = require('./routes/chatRoutes/chats'); // ← Nueva ruta
const messagesRoutes = require('./routes/chatRoutes/messages'); // ← Nueva ruta

// Inicializar Express
const app = express();

// Middlewares globales
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // ← Nueva ruta
app.use('/api/admin', adminRoutes); // ← Nueva ruta
app.use('/api/profile-images', profileImageRoutes); // ← Nueva ruta para imágenes de perfil
app.use('/api/services', serviceRoutes); // ← Nueva ruta
app.use('/api/tags', tagsRoutes); // ← Nueva ruta
app.use('/api/reviews', reviewsRoutes); // ← Nueva ruta
app.use('/api/service-contacts', serviceContactsRoutes); // ← Nueva ruta
app.use('/api/service-covers', serviceCoversRoutes); // ← Nueva ruta para service covers
app.use('/api/service-photos', servicePhotosRoutes); // ← Nueva ruta para service photos
app.use('/api/chats', chatsRoutes); // ← Nueva ruta
app.use('/api/messages', messagesRoutes); // ← Nueva ruta

// Ruta de salud para probar el servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MapyWorks API is running',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Manejo de rutas no encontradas (DEBE ir al final)
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
