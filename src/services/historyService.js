const db = require('../db');

const getHistory = async () => {
  const result = await db.query('SELECT * FROM history');
  return result.rows;
};

module.exports = {
  getHistory,
};
