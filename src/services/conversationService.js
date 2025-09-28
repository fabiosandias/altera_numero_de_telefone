const db = require("../db");
const { normalizeBrazilPhone } = require("../utils/phone");

const applyPhoneNormalization = async (rows) => {
  const processed = new Set();
  const updatedRows = [];

  for (const row of rows) {
    const originalValue = row.phone_number ?? "";
    const normalized = normalizeBrazilPhone(originalValue);

    console.log("conversation phone:", normalized);

    const shouldUpdate =
      normalized && originalValue && normalized !== originalValue;

    if (shouldUpdate) {
      if (row.id == null) {
        console.warn("conversation row sem id, ignorando atualização", {
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
            console.error("Erro ao atualizar phone_number em conversation", {
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
  const result = await db.query("SELECT * FROM conversation_control");
  const normalizedRows = await applyPhoneNormalization(result.rows);
  return normalizedRows;
};

const removeConversationDuplicates = async () => {
  const result = await db.query(
    "SELECT id, phone_number FROM conversation_control ORDER BY id ASC"
  );

  const seen = new Map();
  const removedIds = [];
  const failedIds = [];

  for (const row of result.rows) {
    const keyValue = row.phone_number;

    if (keyValue == null) {
      continue;
    }

    const normalizedKey = keyValue.toString();

    if (!seen.has(normalizedKey)) {
      seen.set(normalizedKey, row.id);
      continue;
    }

    if (row.id == null) {
      console.warn("conversation duplicata sem id; não foi possível excluir", {
        keyValue,
      });
      failedIds.push(row.id);
      continue;
    }

    try {
      await db.sql`
        DELETE FROM conversation_control
        WHERE id = ${row.id}
      `;
      removedIds.push(row.id);
    } catch (error) {
      console.error("Erro ao excluir duplicata em conversation", {
        rowId: row.id,
        keyValue,
        error,
      });
      failedIds.push(row.id);
    }
  }

  return {
    total: result.rows.length,
    removed: removedIds.length,
    failed: failedIds.length,
    removedIds,
    failedIds,
  };
};

module.exports = {
  getConversation,
  removeConversationDuplicates,
};
