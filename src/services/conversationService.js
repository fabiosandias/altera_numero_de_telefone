const db = require('../db');

const getConversation = async () => {
  const result = await db.query('SELECT * FROM conversation');
  return result.rows;
};

module.exports = {
  getConversation,
};
