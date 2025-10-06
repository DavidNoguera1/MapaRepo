const Chat = require('../../models/chatModels/Chat');
const Message = require('../../models/chatModels/Message');

// Middleware para verificar participación en chat
const checkChatParticipation = async (req, res, next) => {
  try {
    const chatId = req.params.chatId || req.params.id;
    const isParticipant = await Chat.isParticipant(chatId, req.userId);

    if (!isParticipant && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este chat' });
    }

    next();
  } catch (error) {
    console.error('Error en checkChatParticipation:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear chat
const createChat = async (req, res) => {
  try {
    const { participants, service_id } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ error: 'Se requieren al menos 2 participantes' });
    }

    // Verificar que el usuario actual esté incluido
    if (!participants.includes(req.userId)) {
      participants.push(req.userId);
    }

    // Para chats 1-1, verificar si ya existe
    if (participants.length === 2) {
      const existingChat = await Chat.findExistingChat(participants[0], participants[1], service_id);
      if (existingChat) {
        return res.status(409).json({
          error: 'Ya existe un chat entre estos usuarios',
          chat_id: existingChat.id
        });
      }
    }

    // Crear chat
    const chat = await Chat.create({
      service_id,
      created_by: req.userId
    });

    // Añadir participantes
    for (const userId of participants) {
      await Chat.addParticipant(chat.id, userId);
    }

    res.status(201).json({ message: 'Chat creado exitosamente', chat });
  } catch (error) {
    console.error('Error creando chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener chats del usuario
const getUserChats = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const chats = await Chat.findByUserId(req.userId, limit, offset);
    res.json({ chats });
  } catch (error) {
    console.error('Error obteniendo chats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener detalles de un chat
const getChatDetails = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    const participants = await Chat.getParticipants(chatId);
    res.json({ chat, participants });
  } catch (error) {
    console.error('Error obteniendo detalles del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar chat (solo admin)
const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const deleted = await Chat.delete(chatId);

    if (!deleted) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    res.json({ message: 'Chat eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createChat,
  getUserChats,
  getChatDetails,
  deleteChat,
  checkChatParticipation
};
