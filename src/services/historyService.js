const db = require("../db");
const { normalizeBrazilPhone } = require("../utils/phone");

const applyPhoneNormalization = async (rows) => {
  const processed = new Set();
  const updatedRows = [];

  for (const row of rows) {
    const originalValue = row.session_id ?? "";
    const normalized = normalizeBrazilPhone(originalValue);

    console.log("history phone:", normalized);

    const shouldUpdate =
      normalized && originalValue && normalized !== originalValue;

    if (shouldUpdate) {
      if (row.id == null) {
        console.warn("history row sem id, ignorando atualização", {
          originalValue,
          normalized,
        });
      } else {
        const dedupeKey = `${row.id}->${normalized}`;

        if (!processed.has(dedupeKey)) {
          try {
            await db.sql`
              UPDATE n8n_chat_histories_teste
              SET session_id = ${normalized}
              WHERE id = ${row.id}
            `;
          } catch (error) {
            console.error("Erro ao atualizar session_id em history", {
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
      session_id: normalized,
    });
  }

  return updatedRows;
};

const getHistory = async () => {
  const result = await db.query("SELECT * FROM n8n_chat_histories_teste");
  const normalizedRows = await applyPhoneNormalization(result.rows);
  return normalizedRows;
};

module.exports = {
  getHistory,
};
