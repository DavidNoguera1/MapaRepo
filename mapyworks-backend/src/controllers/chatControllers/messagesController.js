const Message = require('../../models/chatModels/Message');
const Chat = require('../../models/chatModels/Chat');

// Middleware para verificar participación en chat
const checkChatParticipation = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
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

// Enviar mensaje (solo texto)
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Se requiere contenido de texto válido' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'El mensaje no puede exceder 1000 caracteres' });
    }

    const message = await Message.create({
      chat_id: chatId,
      sender_id: req.userId,
      content: content.trim(),
      content_type: 'text'
    });

    // Actualizar last_message_at del chat
    await Chat.updateLastMessage(chatId);

    res.status(201).json({ message: 'Mensaje enviado exitosamente', message });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener mensajes de un chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await Message.findByChatId(chatId, limit, offset);
    res.json({ messages });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Marcar mensaje como leído
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.markAsRead(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    res.json({ message: 'Mensaje marcado como leído', message });
  } catch (error) {
    console.error('Error marcando mensaje como leído:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar mensaje
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deleted = await Message.delete(messageId);

    if (!deleted) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  checkChatParticipation
};
