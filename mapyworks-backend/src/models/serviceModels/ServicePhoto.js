const pool = require('../../config/database');

class ServicePhoto {
  // Crear nueva foto
  static async create(photoData) {
    const {
      service_id,
      photo_url,
      position = 0
    } = photoData;

    const query = `
      INSERT INTO service_photos
        (service_id, photo_url, position)
      VALUES ($1, $2, $3)
      RETURNING id, service_id, photo_url, position, created_at
    `;

    const values = [service_id, photo_url, position];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar fotos por service_id
  static async findByServiceId(service_id) {
    const query = `
      SELECT id, service_id, photo_url, position, created_at
      FROM service_photos
      WHERE service_id = $1
      ORDER BY position ASC, created_at ASC
    `;

    const result = await pool.query(query, [service_id]);
    return result.rows;
  }

  // Buscar foto por ID
  static async findById(id) {
    const query = `
      SELECT id, service_id, photo_url, position, created_at
      FROM service_photos
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar foto
  static async update(id, updateData) {
    const { photo_url, position } = updateData;

    let setParts = [];
    let values = [];
    let paramIndex = 1;

    if (photo_url !== undefined) {
      setParts.push(`photo_url = $${paramIndex}`);
      values.push(photo_url);
      paramIndex++;
    }

    if (position !== undefined) {
      setParts.push(`position = $${paramIndex}`);
      values.push(position);
      paramIndex++;
    }

    const query = `
      UPDATE service_photos
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, service_id, photo_url, position, created_at
    `;

    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar foto
  static async delete(id) {
    const query = 'DELETE FROM service_photos WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  // Contar fotos por servicio
  static async countByService(service_id) {
    const query = 'SELECT COUNT(*) FROM service_photos WHERE service_id = $1';
    const result = await pool.query(query, [service_id]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = ServicePhoto;
