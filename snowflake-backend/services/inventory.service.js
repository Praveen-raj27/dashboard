import { executeQuery } from "../config/snowflake.js";

export const fetchInventory = async ({
  category,
  supplier,
  stockStatus,
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

  if (category) {
    conditions.push("CATEGORY = ?");
    binds.push(category);
  }

  if (supplier) {
    conditions.push("SUPPLIER = ?");
    binds.push(supplier);
  }

  if (stockStatus === "IN_STOCK") {
    conditions.push("QUANTITY > 10");
  } else if (stockStatus === "LOW_STOCK") {
    conditions.push("QUANTITY BETWEEN 1 AND 10");
  } else if (stockStatus === "OUT_OF_STOCK") {
    conditions.push("QUANTITY <= 0");
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY ITEM_NAME ASC";

  return executeQuery(query, binds);
};