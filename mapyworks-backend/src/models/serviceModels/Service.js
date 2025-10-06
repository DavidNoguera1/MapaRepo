const pool = require('../../config/database');

class Service {
  // Crear nuevo servicio
  static async create(serviceData) {
    const {
      owner_id,
      title,
      description = null,
      cover_image_url = null,
      lat,
      lng,
      address_text = null
    } = serviceData;

    // Crear punto geográfico
    const locationQuery = lat && lng ? `ST_GeomFromText('POINT(${lng} ${lat})', 4326)` : 'NULL';

    const query = `
      INSERT INTO services
        (owner_id, title, description, cover_image_url, location_geog, address_text)
      VALUES ($1, $2, $3, $4, ${locationQuery}, $5)
      RETURNING id, owner_id, title, description, cover_image_url,
                ST_AsText(location_geog) as location_text, address_text,
                is_active, created_at, updated_at, avg_rating, reviews_count
    `;

    const values = [
      owner_id,
      title,
      description,
      cover_image_url,
      address_text
    ];

    const result = await pool.query(query, values);
    const service = result.rows[0];

    // Parsear location_text a lat/lng
    if (service.location_text) {
      const match = service.location_text.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match) {
        service.lat = parseFloat(match[2]);
        service.lng = parseFloat(match[1]);
      }
      delete service.location_text;
    }

    return service;
  }

  // Buscar servicio por ID
  static async findById(id) {
    const query = `
      SELECT s.id, s.owner_id, s.title, s.description, s.cover_image_url,
             ST_AsText(s.location_geog) as location_text, s.address_text,
             s.is_active, s.created_at, s.updated_at, s.avg_rating, s.reviews_count,
             u.user_name as owner_name,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', t.id,
                   'name', t.name
                 )
               ) FILTER (WHERE t.id IS NOT NULL),
               '[]'::json
             ) as tags
      FROM services s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN service_tags st ON s.id = st.service_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE s.id = $1
      GROUP BY s.id, s.owner_id, s.title, s.description, s.cover_image_url,
               s.location_geog, s.address_text, s.is_active, s.created_at,
               s.updated_at, s.avg_rating, s.reviews_count, u.user_name
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    const service = result.rows[0];

    // Parsear location_text a lat/lng
    if (service.location_text) {
      const match = service.location_text.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match) {
        service.lat = parseFloat(match[2]);
        service.lng = parseFloat(match[1]);
      }
      delete service.location_text;
    }

    // Parsear tags JSON
    if (service.tags) {
      service.tags = service.tags;
    }

    return service;
  }

  // Listar servicios activos con paginación y búsqueda por título
  static async findAll(limit = 10, offset = 0, search = '') {
    let query = `
      SELECT s.id, s.owner_id, s.title, s.description, s.cover_image_url,
             ST_AsText(s.location_geog) as location_text, s.address_text,
             s.is_active, s.created_at, s.updated_at, s.avg_rating, s.reviews_count,
             u.user_name as owner_name,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', t.id,
                   'name', t.name
                 )
               ) FILTER (WHERE t.id IS NOT NULL),
               '[]'::json
             ) as tags
      FROM services s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN service_tags st ON s.id = st.service_id
      LEFT JOIN tags t ON st.tag_id = t.id
    `;

    const values = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
      query += ` AND LOWER(s.title) LIKE $${paramIndex}`;
      values.push('%' + search.toLowerCase() + '%');
      paramIndex++;
    }

    query += `
      GROUP BY s.id, s.owner_id, s.title, s.description, s.cover_image_url,
               s.location_geog, s.address_text, s.is_active, s.created_at,
               s.updated_at, s.avg_rating, s.reviews_count, u.user_name
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit);
    values.push(offset);

    const result = await pool.query(query, values);
    const services = result.rows;

    // Parsear locations y tags
    services.forEach(service => {
      if (service.location_text) {
        const match = service.location_text.match(/POINT\(([^ ]+) ([^)]+)\)/);
        if (match) {
          service.lat = parseFloat(match[2]);
          service.lng = parseFloat(match[1]);
        }
        delete service.location_text;
      }

      // Parsear tags JSON
      if (service.tags) {
        service.tags = service.tags;
      }
    });

    return services;
  }

  // Listar servicios por owner
  static async findByOwner(owner_id, limit = 10, offset = 0) {
    const query = `
      SELECT id, owner_id, title, description, cover_image_url,
             ST_AsText(location_geog) as location_text, address_text,
             is_active, created_at, updated_at, avg_rating, reviews_count
      FROM services
      WHERE owner_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [owner_id, limit, offset]);
    const services = result.rows;

    // Parsear locations
    services.forEach(service => {
      if (service.location_text) {
        const match = service.location_text.match(/POINT\(([^ ]+) ([^)]+)\)/);
        if (match) {
          service.lat = parseFloat(match[2]);
          service.lng = parseFloat(match[1]);
        }
        delete service.location_text;
      }
    });

    return services;
  }

  // Actualizar servicio
  static async update(id, updateData) {
    const {
      title,
      description,
      cover_image_url,
      lat,
      lng,
      address_text,
      is_active
    } = updateData;

    let setParts = [];
    let values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      setParts.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      setParts.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (cover_image_url !== undefined) {
      setParts.push(`cover_image_url = $${paramIndex}`);
      values.push(cover_image_url);
      paramIndex++;
    }

    if (lat !== undefined && lng !== undefined) {
      setParts.push(`location_geog = ST_GeomFromText('POINT(${lng} ${lat})', 4326)`);
    }

    if (address_text !== undefined) {
      setParts.push(`address_text = $${paramIndex}`);
      values.push(address_text);
      paramIndex++;
    }

    if (is_active !== undefined) {
      setParts.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    setParts.push('updated_at = NOW()');

    const query = `
      UPDATE services
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, owner_id, title, description, cover_image_url,
                ST_AsText(location_geog) as location_text, address_text,
                is_active, created_at, updated_at, avg_rating, reviews_count
    `;

    values.push(id);

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;

    const service = result.rows[0];

    // Parsear location_text a lat/lng
    if (service.location_text) {
      const match = service.location_text.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match) {
        service.lat = parseFloat(match[2]);
        service.lng = parseFloat(match[1]);
      }
      delete service.location_text;
    }

    return service;
  }

  // Eliminar servicio permanentemente
  static async delete(id) {
    const query = 'DELETE FROM services WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  // Contar servicios totales
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) FROM services WHERE 1=1`;
    const values = [];
    let paramIndex = 1;

    if (filters.owner_id) {
      query += ` AND owner_id = $${paramIndex}`;
      values.push(filters.owner_id);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(filters.is_active);
      paramIndex++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  // Actualizar avg_rating y reviews_count
  static async updateRating(service_id, avg_rating, reviews_count) {
    const query = `
      UPDATE services
      SET avg_rating = $1, reviews_count = $2, updated_at = now()
      WHERE id = $3
      RETURNING *
    `;
    const values = [avg_rating, reviews_count, service_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Service;
