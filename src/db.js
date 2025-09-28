const postgres = require('postgres');

const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : undefined;

const commonOptions = {
  ssl: sslConfig,
  max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : undefined,
  idle_timeout: process.env.DB_POOL_IDLE ? Number(process.env.DB_POOL_IDLE) : undefined,
};

const createSqlClient = () => {
  if (process.env.DATABASE_URL) {
    return postgres(process.env.DATABASE_URL, commonOptions);
  }

  return postgres({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ...commonOptions,
  });
};

const sql = createSqlClient();

const query = async (text, params = []) => {
  const result = await sql.unsafe(text, params);
  return { rows: result };
};

module.exports = {
  query,
  sql,
};
