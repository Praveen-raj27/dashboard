
import { executeQuery } from "../config/snowflake.js";

export const fetchInventory = async ({
  startDate,
  endDate,
  category,
} = {}) => {
  let query = `
    SELECT
      ITEM_ID,
      ITEM_NAME,
      CATEGORY,
      QUANTITY,
      UNIT_PRICE,
      SUPPLIER,
      CREATED_AT
    FROM INVENTORY
  `;

  const conditions = [];
  const binds = [];

  if (startDate) {
    conditions.push(
      "CREATED_AT >= TO_TIMESTAMP_NTZ(?)"
    );
    binds.push(`${startDate} 00:00:00`);
  }

  if (endDate) {
    conditions.push(
      "CREATED_AT < DATEADD(DAY, 1, TO_DATE(?))"
    );
    binds.push(endDate);
  }

  if (category) {
    conditions.push("CATEGORY = ?");
    binds.push(category);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY ITEM_NAME ASC";

  return executeQuery(query, binds);
};
