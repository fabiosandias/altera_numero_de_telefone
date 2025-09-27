const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : undefined,
  idleTimeoutMillis: process.env.DB_POOL_IDLE ? Number(process.env.DB_POOL_IDLE) : undefined,
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
};
