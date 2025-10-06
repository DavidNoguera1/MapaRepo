const pool = require('../../config/database');

class Review {
  // Crear una nueva review
  static async create(reviewData) {
    const {
      user_id,
      service_id,
      rating,
      title = null,
      comment = null
    } = reviewData;

    const query = `
      INSERT INTO reviews (user_id, service_id, rating, title, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [user_id, service_id, rating, title, comment];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar review por ID
  static async findById(id) {
    const query = `
      SELECT * FROM reviews WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Buscar review por user_id y service_id
  static async findByUserAndService(user_id, service_id) {
    const query = `
      SELECT * FROM reviews WHERE user_id = $1 AND service_id = $2
    `;
    const result = await pool.query(query, [user_id, service_id]);
    return result.rows[0];
  }

  // Obtener todas las reviews de un servicio
  static async findByServiceId(service_id, limit = 10, offset = 0) {
    const query = `
      SELECT r.*, COALESCE(u.user_name, 'Usuario eliminado') as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.service_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [service_id, limit, offset]);
    return result.rows;
  }

  // Actualizar review
  static async update(id, updateData) {
    const { rating, title, comment } = updateData;
    const query = `
      UPDATE reviews
      SET rating = $1, title = $2, comment = $3, updated_at = now()
      WHERE id = $4
      RETURNING *
    `;
    const values = [rating, title, comment, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar review
  static async delete(id) {
    const query = `
      DELETE FROM reviews WHERE id = $1 RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Contar reviews de un servicio
  static async countByService(service_id) {
    const query = `
      SELECT COUNT(*) as count FROM reviews WHERE service_id = $1
    `;
    const result = await pool.query(query, [service_id]);
    return parseInt(result.rows[0].count);
  }

  // Calcular promedio de rating de un servicio
  static async averageRating(service_id) {
    const query = `
      SELECT AVG(rating) as avg_rating FROM reviews WHERE service_id = $1
    `;
    const result = await pool.query(query, [service_id]);
    return result.rows[0].avg_rating;
  }
}

module.exports = Review;
