
import { executeQuery } from "../snowflake.js";

export const fetchSales = async ({
  startDate,
  endDate,
  category,
  region,
}) => {
  let query = `
    SELECT
      ID,
      PRODUCT_NAME,
      CATEGORY,
      AMOUNT,
      REGION,
      SALE_DATE
    FROM SALES
  `;

  const conditions = [];
  const binds = [];

  if (startDate) {
    conditions.push("SALE_DATE >= TO_DATE(?)");
    binds.push(startDate);
  }

  if (endDate) {
    conditions.push("SALE_DATE <= TO_DATE(?)");
    binds.push(endDate);
  }

  if (category) {
    conditions.push("CATEGORY = ?");
    binds.push(category);
  }

  if (region) {
    conditions.push("REGION = ?");
    binds.push(region);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY SALE_DATE DESC";

  return await executeQuery(query, binds);
};
