const db = require('../db');
const { normalizeBrazilPhone } = require('../utils/phone');

const applyPhoneNormalization = async (rows) => {
  const processed = new Set();
  const updatedRows = [];

  for (const row of rows) {
    const originalValue = row.phone_number ?? '';
    const normalized = normalizeBrazilPhone(originalValue);

    console.log('conversation phone:', normalized);

    const shouldUpdate = normalized && originalValue && normalized !== originalValue;

    if (shouldUpdate) {
      if (row.id == null) {
        console.warn('conversation row sem id, ignorando atualização', {
          originalValue,
          normalized,
        });
      } else {
        const dedupeKey = `${row.id}->${normalized}`;

        if (!processed.has(dedupeKey)) {
          try {
            await db.sql`
              UPDATE conversation_control_teste
              SET phone_number = ${normalized}
              WHERE id = ${row.id}
            `;
          } catch (error) {
            console.error('Erro ao atualizar phone_number em conversation', {
              rowId: row.id,
              originalValue,
              normalized,
              error,
            });
          }

          processed.add(dedupeKey);
        }
      }
    }

    updatedRows.push({
      ...row,
      phone_number: normalized,
    });
  }

  return updatedRows;
};

const getConversation = async () => {
  const result = await db.query('SELECT * FROM conversation_control_teste');
  const normalizedRows = await applyPhoneNormalization(result.rows);
  return normalizedRows;
};

module.exports = {
  getConversation,
};
