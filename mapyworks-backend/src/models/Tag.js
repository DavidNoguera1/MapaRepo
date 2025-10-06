const pool = require('../config/database');

class Tag {
  // Crear un nuevo tag
  static async create(tagData) {
    const {
      name           // Nombre del tag (normalizado a minúsculas)
    } = tagData;

    const query = `
      INSERT INTO tags
        (name)
      VALUES (LOWER($1))
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `;

    const values = [
      name
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar tag por nombre
  static async findByName(name) {
    const query = `
      SELECT * FROM tags WHERE name = LOWER($1)
    `;
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Buscar tag por ID
  static async findById(id) {
    const query = `
      SELECT * FROM tags WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener todos los tags
  static async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM tags
      ORDER BY name ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Buscar tags por nombre (búsqueda parcial)
  static async searchByName(name, limit = 20) {
    const query = `
      SELECT * FROM tags
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${name}%`, limit]);
    return result.rows;
  }

  // Eliminar tag (solo si no está siendo usado)
  static async delete(id) {
    const query = `
      DELETE FROM tags WHERE id = $1 RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si un tag existe
  static async exists(name) {
    const query = `
      SELECT 1 FROM tags WHERE name = LOWER($1)
    `;
    const result = await pool.query(query, [name]);
    return result.rowCount > 0;
  }

  // Añadir tag a un servicio
  static async addToService(service_id, tag_id) {
    const query = `
      INSERT INTO service_tags (service_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT (service_id, tag_id) DO NOTHING
    `;
    await pool.query(query, [service_id, tag_id]);
  }

  // Remover tag de un servicio
  static async removeFromService(service_id, tag_id) {
    const query = `
      DELETE FROM service_tags
      WHERE service_id = $1 AND tag_id = $2
    `;
    await pool.query(query, [service_id, tag_id]);
  }

  // Obtener tags de un servicio
  static async getTagsForService(service_id) {
    const query = `
      SELECT t.* FROM tags t
      JOIN service_tags st ON t.id = st.tag_id
      WHERE st.service_id = $1
      ORDER BY t.name ASC
    `;
    const result = await pool.query(query, [service_id]);
    return result.rows;
  }

  // Obtener servicios que tienen un tag
  static async getServicesForTag(tag_id, limit = 10, offset = 0) {
    const query = `
      SELECT s.* FROM services s
      JOIN service_tags st ON s.id = st.service_id
      WHERE st.tag_id = $1 AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [tag_id, limit, offset]);
    return result.rows;
  }

  // Buscar tags con similitud (usando pg_trgm)
  static async searchSimilar(name, limit = 10) {
    const query = `
      SELECT * FROM tags
      WHERE name % $1
      ORDER BY similarity(name, $1) DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [name, limit]);
    return result.rows;
  }
}

module.exports = Tag;
