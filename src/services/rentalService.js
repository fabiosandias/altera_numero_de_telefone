const db = require('../db');
const { normalizeBrazilPhone } = require('../utils/phone');

const applyPhoneNormalization = async (rows) => {
  const processed = new Set();
  const updatedRows = [];

  for (const row of rows) {
    const originalValue = row.whatsapp ?? '';
    const normalized = normalizeBrazilPhone(originalValue);

    console.log('rental phone:', normalized);

    const shouldUpdate = normalized && originalValue && normalized !== originalValue;

    if (shouldUpdate) {
      if (row.id == null) {
        console.warn('rental row sem id, ignorando atualização', {
          originalValue,
          normalized,
        });
      } else {
        const dedupeKey = `${row.id}->${normalized}`;

        if (!processed.has(dedupeKey)) {
          try {
            await db.sql`
              UPDATE rental_leads_teste
              SET whatsapp = ${normalized}
              WHERE id = ${row.id}
            `;
          } catch (error) {
            console.error('Erro ao atualizar whatsapp em rental', {
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
      whatsapp: normalized,
    });
  }

  return updatedRows;
};

const getRental = async () => {
  const result = await db.query('SELECT * FROM rental_leads_teste');
  const normalizedRows = await applyPhoneNormalization(result.rows);
  return normalizedRows;
};

module.exports = {
  getRental,
};
