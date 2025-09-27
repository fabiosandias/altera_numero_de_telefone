const db = require('../db');

const getRental = async () => {
  const result = await db.query('SELECT * FROM rental');
  return result.rows;
};

module.exports = {
  getRental,
};
