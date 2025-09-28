const db = require("../db");
const { normalizeBrazilPhone } = require("../utils/phone");

const applyPhoneNormalization = async (rows) => {
  const processed = new Set();
  const updatedRows = [];

  for (const row of rows) {
    const originalValue = row.whatsapp ?? "";
    const normalized = normalizeBrazilPhone(originalValue);

    console.log("rental phone:", normalized);

    const shouldUpdate =
      normalized && originalValue && normalized !== originalValue;

    if (shouldUpdate) {
      if (row.id == null) {
        console.warn("rental row sem id, ignorando atualização", {
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
            console.error("Erro ao atualizar whatsapp em rental", {
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
  const result = await db.query("SELECT * FROM rental_leads");
  const normalizedRows = await applyPhoneNormalization(result.rows);
  return normalizedRows;
};

const removeRentalDuplicates = async () => {
  const result = await db.query(
    "SELECT id, whatsapp FROM rental_leads ORDER BY id ASC"
  );

  const seen = new Map();
  const removedIds = [];
  const failedIds = [];

  for (const row of result.rows) {
    const keyValue = row.whatsapp;

    if (keyValue == null) {
      continue;
    }

    const normalizedKey = keyValue.toString();

    if (!seen.has(normalizedKey)) {
      seen.set(normalizedKey, row.id);
      continue;
    }

    if (row.id == null) {
      console.warn("rental duplicata sem id; não foi possível excluir", {
        keyValue,
      });
      failedIds.push(row.id);
      continue;
    }

    try {
      await db.sql`
        DELETE FROM rental_leads
        WHERE id = ${row.id}
      `;
      removedIds.push(row.id);
    } catch (error) {
      console.error("Erro ao excluir duplicata em rental", {
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
  getRental,
  removeRentalDuplicates,
};
