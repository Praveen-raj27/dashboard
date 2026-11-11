
import { executeQuery } from "../config/snowflake.js";

// HELPER: Get customer email using authenticated user ID
const getCustomerEmail = async (userId) => {
  const users = await executeQuery(
    `SELECT EMAIL
     FROM USERS
     WHERE ID = ?
     LIMIT 1`,
    [userId]
  );

  if (!users || users.length === 0) {
    const error = new Error("Customer account not found.");
    error.statusCode = 404;
    throw error;
  }

  return users[0].EMAIL;
};

// 1. GET ALL ORDERS FOR LOGGED-IN CUSTOMER
export const getCustomerOrders = async (userId) => {
  const email = await getCustomerEmail(userId);

  const orders = await executeQuery(
    `SELECT
        ORDER_ID,
        CUSTOMER_NAME,
        SUBTOTAL,
        TOTAL_AMOUNT,
        CURRENCY,
        ORDER_STATUS,
        PAYMENT_STATUS,
        DELIVERY_STATUS,
        TRACKING_NUMBER,
        DELIVERY_PARTNER,
        ESTIMATED_DELIVERY_DATE,
        CREATED_AT,
        SHIPPED_AT,
        DELIVERED_AT
     FROM ORDERS
     WHERE LOWER(CUSTOMER_EMAIL) = LOWER(?)
     ORDER BY CREATED_AT DESC`,
    [email]
  );

  return orders;
};

// 2. GET INDIVIDUAL ORDER DETAILS
export const getOrderDetails = async (userId, orderId) => {
  const email = await getCustomerEmail(userId);

  const orders = await executeQuery(
    `SELECT *
     FROM ORDERS
     WHERE ORDER_ID = ?
     AND LOWER(CUSTOMER_EMAIL) = LOWER(?)
     LIMIT 1`,
    [orderId, email]
  );

  if (!orders || orders.length === 0) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  return orders[0];
};

// 3. GET ORDER TRACKING HISTORY
export const getOrderTrackingHistory = async (userId, orderId) => {
  // Verify that this order belongs to the customer
  await getOrderDetails(userId, orderId);

  const trackingHistory = await executeQuery(
    `SELECT
        TRACKING_ID,
        ORDER_ID,
        STATUS,
        DESCRIPTION,
        LOCATION,
        UPDATED_BY,
        CREATED_AT
     FROM ORDER_TRACKING
     WHERE ORDER_ID = ?
     ORDER BY CREATED_AT ASC, TRACKING_ID ASC`,
    [orderId]
  );

  return trackingHistory;
};


// 4. GET ALL ORDERS FOR ADMIN DELIVERY MANAGEMENT
export const getAllDeliveryOrders = async () => {
  const orders = await executeQuery(
    `SELECT
        ORDER_ID,
        CUSTOMER_NAME,
        CUSTOMER_EMAIL,
        CUSTOMER_PHONE,
        SHIPPING_ADDRESS,
        CITY,
        STATE,
        PINCODE,
        TOTAL_AMOUNT,
        PAYMENT_STATUS,
        ORDER_STATUS,
        DELIVERY_STATUS,
        TRACKING_NUMBER,
        DELIVERY_PARTNER,
        TRACKING_URL,
        ESTIMATED_DELIVERY_DATE,
        CREATED_AT,
        SHIPPED_AT,
        DELIVERED_AT
     FROM ORDERS
     ORDER BY CREATED_AT DESC`
  );

  return orders;
};


export const assignDeliveryDetails = async ({
  orderId,
  deliveryPartner,
  trackingNumber,
  trackingUrl,
  estimatedDeliveryDate,
  adminId,
}) => {
  // Verify order and payment status
  const orders = await executeQuery(
    `SELECT ORDER_ID, PAYMENT_STATUS, ORDER_STATUS
     FROM ORDERS
     WHERE ORDER_ID = ?
     LIMIT 1`,
    [orderId]
  );

  if (!orders.length) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  const order = orders[0];

  if (
    order.PAYMENT_STATUS !== "PAID" ||
    order.ORDER_STATUS !== "CONFIRMED"
  ) {
    const error = new Error(
      "Delivery can only be assigned to paid and confirmed orders."
    );
    error.statusCode = 400;
    throw error;
  }

  // Update delivery information
  await executeQuery(
    `UPDATE ORDERS
     SET DELIVERY_PARTNER = ?,
         TRACKING_NUMBER = ?,
         TRACKING_URL = ?,
         ESTIMATED_DELIVERY_DATE = TO_TIMESTAMP_NTZ(?),
         UPDATED_AT = CURRENT_TIMESTAMP()
     WHERE ORDER_ID = ?`,
    [
      deliveryPartner,
      trackingNumber,
      trackingUrl || null,
      estimatedDeliveryDate,
      orderId,
    ]
  );

  // Record tracking event
  await executeQuery(
    `INSERT INTO ORDER_TRACKING (
       ORDER_ID,
       STATUS,
       DESCRIPTION,
       LOCATION,
       UPDATED_BY
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
      orderId,
      "ORDER_CONFIRMED",
      `Delivery assigned to ${deliveryPartner}. Tracking number: ${trackingNumber}`,
      null,
      adminId,
    ]
  );

  return {
    orderId,
    deliveryPartner,
    trackingNumber,
    trackingUrl,
    estimatedDeliveryDate,
  };
};


const DELIVERY_STATUS_FLOW = {
  ORDER_CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

export const updateDeliveryStatus = async ({
  orderId,
  newStatus,
  description,
  location,
  adminId,
}) => {
  const orders = await executeQuery(
    `SELECT ORDER_ID, DELIVERY_STATUS, PAYMENT_STATUS,
            DELIVERY_PARTNER, TRACKING_NUMBER
     FROM ORDERS
     WHERE ORDER_ID = ?
     LIMIT 1`,
    [orderId]
  );

  if (!orders.length) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  const order = orders[0];
  const expectedStatus = DELIVERY_STATUS_FLOW[order.DELIVERY_STATUS];

  if (!expectedStatus || expectedStatus !== newStatus) {
    const error = new Error(
      `Invalid delivery transition. Current status: ${order.DELIVERY_STATUS}.`
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    order.PAYMENT_STATUS !== "PAID" ||
    !order.DELIVERY_PARTNER ||
    !order.TRACKING_NUMBER
  ) {
    const error = new Error(
      "A paid order with an assigned delivery partner is required."
    );
    error.statusCode = 400;
    throw error;
  }

  await executeQuery(
    `UPDATE ORDERS
     SET DELIVERY_STATUS = ?,
         SHIPPED_AT = CASE
           WHEN ? = 'SHIPPED' THEN CURRENT_TIMESTAMP()
           ELSE SHIPPED_AT
         END,
         DELIVERED_AT = CASE
           WHEN ? = 'DELIVERED' THEN CURRENT_TIMESTAMP()
           ELSE DELIVERED_AT
         END,
         UPDATED_AT = CURRENT_TIMESTAMP()
     WHERE ORDER_ID = ?`,
    [newStatus, newStatus, newStatus, orderId]
  );

  await executeQuery(
    `INSERT INTO ORDER_TRACKING (
       ORDER_ID, STATUS, DESCRIPTION, LOCATION, UPDATED_BY
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
      orderId,
      newStatus,
      description || `Order status updated to ${newStatus}.`,
      location || null,
      adminId,
    ]
  );

  return {
    orderId,
    previousStatus: order.DELIVERY_STATUS,
    currentStatus: newStatus,
  };
};
