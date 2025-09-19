const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'db',
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
  user: process.env.DATABASE_USER || 'orderbook_user',
  password: process.env.DATABASE_PASSWORD || 'orderbook_pass',
  database: process.env.DATABASE_NAME || 'orderbook_db'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
};
