const pool = require('../../config/database');

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
    const query = `
      DELETE FROM messages WHERE id = $1 RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Message;
