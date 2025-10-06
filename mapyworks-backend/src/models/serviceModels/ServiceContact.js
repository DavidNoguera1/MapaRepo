const pool = require('../../config/database');

class ServiceContact {
  // Crear un nuevo contacto
  static async create(contactData) {
    const {
      service_id,
      contact_type,
      contact_value,
      label = null
    } = contactData;

    const query = `
      INSERT INTO service_contacts (service_id, contact_type, contact_value, label)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [service_id, contact_type, contact_value, label];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar contacto por ID
  static async findById(id) {
    const query = `
      SELECT * FROM service_contacts WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener contactos de un servicio
  static async findByServiceId(service_id) {
    const query = `
      SELECT * FROM service_contacts
      WHERE service_id = $1
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [service_id]);
    return result.rows;
  }

  // Actualizar contacto
  static async update(id, updateData) {
    const { contact_type, contact_value, label } = updateData;
    const query = `
      UPDATE service_contacts
      SET contact_type = $1, contact_value = $2, label = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [contact_type, contact_value, label, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar contacto
  static async delete(id) {
    const query = `
      DELETE FROM service_contacts WHERE id = $1 RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si el contacto pertenece al servicio
  static async belongsToService(contact_id, service_id) {
    const query = `
      SELECT 1 FROM service_contacts WHERE id = $1 AND service_id = $2
    `;
    const result = await pool.query(query, [contact_id, service_id]);
    return result.rowCount > 0;
  }
}

module.exports = ServiceContact;
