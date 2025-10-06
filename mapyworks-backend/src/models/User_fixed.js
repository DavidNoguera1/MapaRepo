const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Crear nuevo usuario
  static async create(userData) {
    const {
      user_name,
      email,
      phone = null,
      cedula = null,
      password,
      profile_picture_url = null,
      role = 'user'
    } = userData;

    // Hash de la contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users
        (user_name, email, phone, cedula, password_hash, profile_picture_url, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_name, email, phone, cedula, profile_picture_url, role, created_at
    `;

    const values = [
      user_name,
      email,
      phone,
      cedula,
      password_hash,
      profile_picture_url,
      role
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const query = `
      SELECT id, user_name, email, phone, cedula,
             password_hash, profile_picture_url, role, is_active,
             created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Verificar si email ya existe
  static async emailExists(email) {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rowCount > 0;
  }

  static async findByCedula(cedula) {
    if (!cedula) return null;

    const query = `
      SELECT id, user_name, email, phone, cedula,
             password_hash, profile_picture_url, role, is_active,
             created_at, updated_at
      FROM users
      WHERE cedula = $1
    `;

    const result = await pool.query(query, [cedula]);
    return result.rows[0];
  }

  // Verificar si cédula ya existe
  static async cedulaExists(cedula) {
    if (!cedula) return false;
    const query = 'SELECT 1 FROM users WHERE cedula = $1';
    const result = await pool.query(query, [cedula]);
    return result.rowCount > 0;
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Buscar usuario por ID
  static async findById(id) {
    const query = `
      SELECT id, user_name, email, phone, cedula,
             password_hash, profile_picture_url, role, is_active,
             created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar usuario
  static async update(id, updateData) {
    const {
      user_name,
      email,
      phone,
      cedula,
      profile_picture_url,
      role,
      is_active
    } = updateData;

    const query = `
      UPDATE users
      SET user_name = $1,
          email = $2,
          phone = $3,
          cedula = $4,
          profile_picture_url = $5,
          role = $6,
          is_active = $7,
          updated_at = NOW()
      WHERE id = $8
      RETURNING id, user_name, email, phone, cedula,
                profile_picture_url, role, is_active, created_at, updated_at
    `;

    const values = [
      user_name,
      email,
      phone,
      cedula,
      profile_picture_url,
      role,
      is_active,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Actualizar solo la URL de la imagen de perfil
  static async updateProfilePicture(id, profilePictureUrl) {
    const query = `
      UPDATE users
      SET profile_picture_url = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, user_name, email, phone, cedula,
                profile_picture_url, role, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, [profilePictureUrl, id]);
    return result.rows[0];
  }

  // Eliminar usuario (soft delete - marcamos como inactivo)
  static async softDelete(id) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, is_active
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar usuario permanentemente (¡CUIDADO! - solo para admins)
  static async hardDelete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, email';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar contraseña
  static async updatePassword(id, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [password_hash, id]);
    return result.rows[0];
  }

  // Buscar usuarios por nombre (para usuarios y admin)
  static async findByName(name, limit = 10, offset = 0) {
    const query = `
      SELECT id, user_name, email, phone, cedula, role, is_active, created_at, updated_at
      FROM users
      WHERE user_name ILIKE $1
      ORDER BY user_name
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [`%${name}%`, limit, offset]);
    return result.rows;
  }

  // Buscar usuarios por filtros (solo admin)
  static async findByFilters(filters = {}, limit = 10, offset = 0) {
    let query = `
      SELECT id, user_name, email, phone, cedula, role, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.user_name) {
      query += ` AND user_name ILIKE $${paramIndex}`;
      values.push(`%${filters.user_name}%`);
      paramIndex++;
    }

    if (filters.email) {
      query += ` AND email ILIKE $${paramIndex}`;
      values.push(`%${filters.email}%`);
      paramIndex++;
    }

    if (filters.cedula) {
      query += ` AND cedula = $${paramIndex}`;
      values.push(filters.cedula);
      paramIndex++;
    }

    if (filters.phone) {
      query += ` AND phone ILIKE $${paramIndex}`;
      values.push(`%${filters.phone}%`);
      paramIndex++;
    }

    if (filters.role) {
      query += ` AND role = $${paramIndex}`;
      values.push(filters.role);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(filters.is_active);
      paramIndex++;
    }

    if (filters.created_after) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(filters.created_after);
      paramIndex++;
    }

    if (filters.created_before) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(filters.created_before);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Listar todos los usuarios con paginación (solo admin)
  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, user_name, email, phone, cedula, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Contar usuarios totales (para paginación)
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) FROM users WHERE 1=1`;
    const values = [];
    let paramIndex = 1;

    if (filters.user_name) {
      query += ` AND user_name ILIKE $${paramIndex}`;
      values.push(`%${filters.user_name}%`);
      paramIndex++;
    }

    if (filters.email) {
      query += ` AND email ILIKE $${paramIndex}`;
      values.push(`%${filters.email}%`);
      paramIndex++;
    }

    if (filters.cedula) {
      query += ` AND cedula = $${paramIndex}`;
      values.push(filters.cedula);
      paramIndex++;
    }

    if (filters.phone) {
      query += ` AND phone ILIKE $${paramIndex}`;
      values.push(`%${filters.phone}%`);
      paramIndex++;
    }

    if (filters.role) {
      query += ` AND role = $${paramIndex}`;
      values.push(filters.role);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(filters.is_active);
      paramIndex++;
    }

    if (filters.created_after) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(filters.created_after);
      paramIndex++;
    }

    if (filters.created_before) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(filters.created_before);
      paramIndex++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }
}

module.exports = User;
