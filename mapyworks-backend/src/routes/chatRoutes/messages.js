const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../../middleware/auth');
const messagesController = require('../../controllers/chatControllers/messagesController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for chat files
  }
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Enviar mensaje a un chat (soporta texto y archivos)
router.post('/:chatId/messages', messagesController.checkChatParticipation, upload.single('file'), messagesController.sendMessage);

// Obtener mensajes de un chat
router.get('/:chatId/messages', messagesController.checkChatParticipation, messagesController.getMessages);

// Marcar mensaje como leído
router.put('/messages/:messageId/read', messagesController.markMessageAsRead);

// Eliminar mensaje
router.delete('/messages/:messageId', messagesController.deleteMessage);

module.exports = router;
