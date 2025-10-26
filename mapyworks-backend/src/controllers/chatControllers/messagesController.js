const Message = require('../../models/chatModels/Message');
const Chat = require('../../models/chatModels/Chat');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads/chat_files');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Generate unique filename
const generateFileName = (chatId, originalName) => {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  return `${chatId}_${timestamp}${ext}`;
};

// Validate file type based on content_type
const validateFile = (file, contentType) => {
  const maxSize = 10 * 1024 * 1024; // 10MB for chat files

  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. El tamaño máximo es 10MB.');
  }

  const typeValidations = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    audio: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  if (typeValidations[contentType] && !typeValidations[contentType].includes(file.mimetype)) {
    throw new Error(`Tipo de archivo no permitido para ${contentType}.`);
  }

  return true;
};

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

// Enviar mensaje (soporta texto y archivos)
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, content_type = 'text' } = req.body;

    // Validar content_type
    const allowedTypes = ['text', 'image', 'video', 'audio', 'document'];
    if (!allowedTypes.includes(content_type)) {
      return res.status(400).json({ error: `Tipo de contenido no válido. Tipos permitidos: ${allowedTypes.join(', ')}` });
    }

    let messageData = {
      chat_id: chatId,
      sender_id: req.userId,
      content_type
    };

    if (content_type === 'text') {
      // Validar mensaje de texto
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Se requiere contenido de texto válido' });
      }
      if (content.length > 1000) {
        return res.status(400).json({ error: 'El mensaje no puede exceder 1000 caracteres' });
      }
      messageData.content = content.trim();
    } else {
      // Manejar archivo multimedia
      if (!req.file) {
        return res.status(400).json({ error: 'Se requiere un archivo para este tipo de mensaje' });
      }

      // Validar archivo
      validateFile(req.file, content_type);

      const uploadDir = await ensureUploadDir();
      const filename = generateFileName(chatId, req.file.originalname);
      const filepath = path.join(uploadDir, filename);

      // Guardar archivo
      await fs.writeFile(filepath, req.file.buffer);

      // Preparar datos del mensaje
      const fileUrl = `/uploads/chat_files/${filename}`;
      messageData.file_url = fileUrl;
      messageData.file_name = req.file.originalname;
      messageData.file_size = req.file.size;
      messageData.content = content && content.trim() ? content.trim() : null;

      // Metadata adicional para ciertos tipos
      if (content_type === 'image' || content_type === 'video') {
        // Aquí se podría agregar lógica para generar thumbnails
        // Por ahora, solo guardamos la info básica
      }
    }

    const message = await Message.create(messageData);

    // Actualizar last_message_at del chat
    await Chat.updateLastMessage(chatId);

    res.status(201).json({ message: 'Mensaje enviado exitosamente', message });
  } catch (error) {
    console.error('Error enviando mensaje:', error);

    // Limpiar archivo si fue subido pero falló la creación del mensaje
    if (req.file && req.file.buffer) {
      try {
        const uploadDir = await ensureUploadDir();
        const filename = generateFileName(req.params.chatId, req.file.originalname);
        const filepath = path.join(uploadDir, filename);
        await fs.unlink(filepath);
      } catch (cleanupError) {
        console.error('Error limpiando archivo:', cleanupError);
      }
    }

    if (error.message.includes('Tipo de archivo') || error.message.includes('tamaño')) {
      return res.status(400).json({ error: error.message });
    }

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

    // Obtener el mensaje antes de eliminarlo para limpiar archivos
    const message = await Message.findById(messageId);

    const deleted = await Message.delete(messageId);

    if (!deleted) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    // Si el mensaje tenía un archivo, eliminarlo del sistema de archivos
    if (message && message.file_url) {
      try {
        const uploadDir = await ensureUploadDir();
        const filename = path.basename(message.file_url);
        const filepath = path.join(uploadDir, filename);
        await fs.unlink(filepath);
      } catch (error) {
        console.log('Archivo del mensaje no encontrado o ya eliminado');
      }
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
