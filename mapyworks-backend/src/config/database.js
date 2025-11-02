const { Pool } = require('pg');
require('dotenv').config();

const isNeon = process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: isNeon
    ? { rejectUnauthorized: false } // 🔹 requerido por Neon
    : false,                        // 🔹 sin SSL si estás local
});

pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
