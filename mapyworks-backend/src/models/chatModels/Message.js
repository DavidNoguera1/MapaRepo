const pool = require('../../config/database');

class Message {
  // Crear un nuevo mensaje (solo texto para chats 1-1)
  static async create(messageData) {
    const {
      chat_id,
      sender_id = null,
      content = null,
      content_type = 'text',
      is_read = false
    } = messageData;

    // Validar que solo sea texto
    if (content_type !== 'text') {
      throw new Error('Solo se permiten mensajes de texto en esta implementación');
    }

    const query = `
      INSERT INTO messages
        (chat_id, sender_id, content, content_type, is_read)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      chat_id,
      sender_id,
      content,
      content_type,
      is_read
    ];

    const result = await pool.query(query, values);
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
