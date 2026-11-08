import { executeQuery } from "../config/snowflake.js";

export const fetchSales = async ({
  category,
  supplier,
  paymentStatus,
} = {}) => {
  let query = `
    SELECT
      O.ORDER_ID,
      O.CUSTOMER_NAME,
      O.CUSTOMER_EMAIL,
      O.CUSTOMER_PHONE,
      O.SHIPPING_ADDRESS,
      O.CITY,
      O.STATE,
      O.PINCODE,
      O.SUBTOTAL,
      O.TOTAL_AMOUNT,
      O.CURRENCY,
      O.ORDER_STATUS,
      O.PAYMENT_STATUS,
      O.RAZORPAY_ORDER_ID,
      O.RAZORPAY_PAYMENT_ID,
      O.CREATED_AT,
      O.UPDATED_AT,

      OI.ORDER_ITEM_ID,
      OI.ITEM_ID,
      OI.ITEM_NAME,
      OI.QUANTITY,
      OI.UNIT_PRICE,
      OI.LINE_TOTAL,

      I.CATEGORY,
      I.SUPPLIER

    FROM ORDERS O

    INNER JOIN ORDER_ITEMS OI
      ON O.ORDER_ID = OI.ORDER_ID

    LEFT JOIN INVENTORY I
      ON OI.ITEM_ID = I.ITEM_ID
  `;

  const conditions = [];
  const binds = [];

  if (category) {
    conditions.push("I.CATEGORY = ?");
    binds.push(category);
  }

  if (supplier) {
    conditions.push("I.SUPPLIER = ?");
    binds.push(supplier);
  }

  if (paymentStatus) {
    conditions.push("O.PAYMENT_STATUS = ?");
    binds.push(paymentStatus);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += `
    ORDER BY O.CREATED_AT DESC, OI.ORDER_ITEM_ID
  `;

  return executeQuery(query, binds);
};