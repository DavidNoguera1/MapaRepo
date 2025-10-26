const pool = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

class Message {
  // Crear un nuevo mensaje (soporta texto y archivos multimedia)
  static async create(messageData) {
    const {
      chat_id,
      sender_id = null,
      content = null,
      content_type = 'text',
      file_url = null,
      file_name = null,
      file_size = null,
      thumbnail_url = null,
      duration = null,
      metadata = null,
      is_read = false
    } = messageData;

    // Validar content_type
    const allowedTypes = ['text', 'image', 'video', 'audio', 'document', 'location', 'link'];
    if (!allowedTypes.includes(content_type)) {
      throw new Error(`Tipo de contenido no válido. Tipos permitidos: ${allowedTypes.join(', ')}`);
    }

    // Para mensajes de archivo, validar que file_url esté presente
    if (content_type !== 'text' && !file_url) {
      throw new Error('Los mensajes de archivo requieren una URL de archivo');
    }

    const query = `
      INSERT INTO messages
        (chat_id, sender_id, content, content_type, file_url, file_name, file_size, thumbnail_url, duration, metadata, is_read)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      chat_id,
      sender_id,
      content,
      content_type,
      file_url,
      file_name,
      file_size,
      thumbnail_url,
      duration,
      metadata,
      is_read
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar mensaje por ID
  static async findById(id) {
    const query = `
      SELECT m.*, u.user_name as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener mensajes de un chat
  static async findByChatId(chat_id, limit = 50, offset = 0) {
    const query = `
      SELECT m.*, u.user_name as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [chat_id, limit, offset]);
    return result.rows;
  }

  // Marcar mensaje como leído
  static async markAsRead(message_id) {
    const query = `
      UPDATE messages
      SET is_read = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [message_id]);
    return result.rows[0];
  }

  // Eliminar mensaje
  static async delete(id) {
    // Primero obtener el mensaje para acceder a file_url y thumbnail_url
    const message = await this.findById(id);
    if (!message) {
      return null; // Mensaje no encontrado
    }

    // Eliminar archivos asociados si existen
    const uploadDir = path.join(process.cwd(), 'uploads/chat_files');

    if (message.file_url) {
      try {
        const filename = path.basename(message.file_url);
        const filepath = path.join(uploadDir, filename);
        await fs.unlink(filepath);
        console.log(`Archivo eliminado: ${filepath}`);
      } catch (error) {
        console.warn(`No se pudo eliminar el archivo ${message.file_url}:`, error.message);
      }
    }

    if (message.thumbnail_url) {
      try {
        const thumbnailFilename = path.basename(message.thumbnail_url);
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        await fs.unlink(thumbnailPath);
        console.log(`Thumbnail eliminado: ${thumbnailPath}`);
      } catch (error) {
        console.warn(`No se pudo eliminar el thumbnail ${message.thumbnail_url}:`, error.message);
      }
    }

    // Eliminar el registro de la base de datos
    const query = `
      DELETE FROM messages WHERE id = $1 RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Message;
