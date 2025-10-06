const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const messagesController = require('../../controllers/chatControllers/messagesController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Enviar mensaje a un chat
router.post('/:chatId/messages', messagesController.checkChatParticipation, messagesController.sendMessage);

// Obtener mensajes de un chat
router.get('/:chatId/messages', messagesController.checkChatParticipation, messagesController.getMessages);

// Marcar mensaje como leído
router.put('/messages/:messageId/read', messagesController.markMessageAsRead);

// Eliminar mensaje
router.delete('/messages/:messageId', messagesController.deleteMessage);

module.exports = router;
