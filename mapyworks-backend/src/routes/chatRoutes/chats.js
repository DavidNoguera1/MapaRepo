const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/adminAuth');
const chatsController = require('../../controllers/chatControllers/chatsController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear chat
router.post('/', chatsController.createChat);

// Obtener chats del usuario
router.get('/', chatsController.getUserChats);

// Obtener detalles de un chat (participante o admin)
router.get('/:chatId', chatsController.checkChatParticipation, chatsController.getChatDetails);

// Eliminar chat (solo admin)
router.delete('/:id', isAdmin, chatsController.deleteChat);

module.exports = router;
