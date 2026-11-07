
import { executeQuery } from "../config/snowflake.js";

export const fetchInventory = async () => {
  const query = `
    SELECT
      ID,
      ITEM_NAME,
      CATEGORY,
      QUANTITY,
      UNIT_PRICE
    FROM INVENTORY
    ORDER BY ITEM_NAME ASC
  `;

  return await executeQuery(query);
};
