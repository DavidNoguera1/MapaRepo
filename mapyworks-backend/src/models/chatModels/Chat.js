const pool = require('../../config/database');

class Chat {
  // Crear un nuevo chat
  static async create(chatData) {
    const {
      service_id = null,
      created_by
    } = chatData;

    const query = `
      INSERT INTO chats (service_id, created_by)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [service_id, created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar chat por ID
  static async findById(id) {
    const query = `
      SELECT c.*, u.user_name as creator_name
      FROM chats c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener chats de un usuario
  static async findByUserId(user_id, limit = 20, offset = 0) {
    const query = `
      SELECT c.*, u.user_name as creator_name,
             m.content as last_message_content,
             m.created_at as last_message_time,
             m.sender_id as last_message_sender
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (chat_id) chat_id, content, created_at, sender_id
        FROM messages
        ORDER BY chat_id, created_at DESC
      ) m ON c.id = m.chat_id
      WHERE cp.user_id = $1
      ORDER BY COALESCE(m.created_at, c.created_at) DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  // Obtener participantes de un chat
  static async getParticipants(chat_id) {
    const query = `
      SELECT u.id, u.user_name, u.email, cp.joined_at
      FROM chat_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.chat_id = $1
      ORDER BY cp.joined_at ASC
    `;
    const result = await pool.query(query, [chat_id]);
    return result.rows;
  }

  // Añadir participante a chat
  static async addParticipant(chat_id, user_id) {
    const query = `
      INSERT INTO chat_participants (chat_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (chat_id, user_id) DO NOTHING
    `;
    await pool.query(query, [chat_id, user_id]);
  }

  // Verificar si usuario es participante
  static async isParticipant(chat_id, user_id) {
    const query = `
      SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [chat_id, user_id]);
    return result.rowCount > 0;
  }

  // Eliminar chat
  static async delete(id) {
    const query = 'DELETE FROM chats WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  // Actualizar last_message_at
  static async updateLastMessage(chat_id) {
    const query = `
      UPDATE chats
      SET last_message_at = now()
      WHERE id = $1
    `;
    await pool.query(query, [chat_id]);
  }

  // Buscar chat existente entre dos usuarios (opcionalmente con servicio)
  static async findExistingChat(user1_id, user2_id, service_id = null) {
    const query = `
      SELECT c.id
      FROM chats c
      JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
      JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = $2
      WHERE ($3::uuid IS NULL OR c.service_id = $3)
      AND NOT EXISTS (
        SELECT 1 FROM chat_participants cp
        WHERE cp.chat_id = c.id AND cp.user_id NOT IN ($1, $2)
      )
    `;
    const result = await pool.query(query, [user1_id, user2_id, service_id]);
    return result.rows[0];
  }
}

module.exports = Chat;
