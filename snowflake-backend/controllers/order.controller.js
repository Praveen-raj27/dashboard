import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import { executeQuery } from "../config/snowflake.js";
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
} from "../services/payment.service.js";

const getField = (item, upper, lower) => item?.[upper] ?? item?.[lower];

export const createOrder = async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer details and cart items are required.",
      });
    }

    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!String(customer[field] ?? "").trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    // Validate and combine duplicate item IDs.
    const requestedItems = new Map();

    for (const item of items) {
      const itemId = String(item.itemId ?? "").trim();
      const quantity = Number(item.quantity);

      if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item.",
        });
      }

      requestedItems.set(itemId, (requestedItems.get(itemId) || 0) + quantity);
    }

    const itemIds = [...requestedItems.keys()];
    const placeholders = itemIds.map(() => "?").join(", ");

    // Read trusted prices and stock from Snowflake.
    const inventory = await executeQuery(
      `SELECT ITEM_ID, ITEM_NAME, QUANTITY, UNIT_PRICE
       FROM INVENTORY
       WHERE ID IN (${placeholders})`,
      itemIds,
    );

    if (inventory.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are no longer available.",
      });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const product of inventory) {
      const itemId = String(product.ITEM_ID);
      const quantity = requestedItems.get(itemId);
      const available = Number(product.QUANTITY);
      const unitPrice = Number(product.UNIT_PRICE);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.ITEM_NAME}.`,
        });
      }

      if (!Number.isFinite(available) || quantity > available) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${product.ITEM_NAME}.`,
        });
      }

      const lineTotal = Number((unitPrice * quantity).toFixed(2));
      subtotal += lineTotal;

      verifiedItems.push({
        itemId,
        itemName: product.ITEM_NAME,
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // No delivery fee for now.
    const totalAmount = subtotal;

    const localOrderId = randomUUID();

    // Create the local pending order first.
    await executeQuery(
      `INSERT INTO ORDERS (
        ORDER_ID, CUSTOMER_NAME, CUSTOMER_EMAIL, CUSTOMER_PHONE,
        SHIPPING_ADDRESS, CITY, STATE, PINCODE,
        SUBTOTAL, TOTAL_AMOUNT, CURRENCY,
        ORDER_STATUS, PAYMENT_STATUS, CREATED_AT, UPDATED_AT
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR',
              'PENDING', 'PENDING', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())`,
      [
        localOrderId,
        customer.name.trim(),
        customer.email.trim().toLowerCase(),
        customer.phone.trim(),
        customer.address.trim(),
        customer.city.trim(),
        customer.state.trim(),
        customer.pincode.trim(),
        subtotal,
        totalAmount,
      ],
    );

    for (const item of verifiedItems) {
      await executeQuery(
        `INSERT INTO ORDER_ITEMS (
          ORDER_ITEM_ID, ORDER_ID, ITEM_ID, ITEM_NAME,
          QUANTITY, UNIT_PRICE, LINE_TOTAL, CREATED_AT
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`,
        [
          randomUUID(),
          localOrderId,
          item.itemId,
          item.itemName,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
        ],
      );
    }

    // Create the payment order on Razorpay's server.
    let razorpayOrder;

    try {
      razorpayOrder = await createRazorpayOrder({
        amount: totalAmount,
        receipt: localOrderId.replaceAll("-", "").slice(0, 40),
      });
    } catch (paymentError) {
      console.error("Razorpay order creation failed:", paymentError);

      return res.status(502).json({
        success: false,
        message: "Unable to initialize payment. Please try again.",
        orderId: localOrderId,
      });
    }

    await executeQuery(
      `UPDATE ORDERS
       SET RAZORPAY_ORDER_ID = ?,
           UPDATED_AT = CURRENT_TIMESTAMP()
       WHERE ORDER_ID = ?`,
      [razorpayOrder.id, localOrderId],
    );

    return res.status(201).json({
      success: true,
      message: "Order created. Continue to payment.",
      orderId: localOrderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("========== CREATE ORDER ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error("Stack:", error.stack);
    console.error("=========================================");

    return res.status(500).json({
      success: false,
      message: "Unable to create order.",
      ...(process.env.NODE_ENV !== "production" && {
        debug: error.message,
        code: error.code,
      }),
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required.",
      });
    }

    // Always retrieve the expected Razorpay order ID from our database.
    const rows = await executeQuery(
      `SELECT ORDER_ID, RAZORPAY_ORDER_ID, TOTAL_AMOUNT, PAYMENT_STATUS
       FROM ORDERS
       WHERE ORDER_ID = ?
       LIMIT 1`,
      [orderId],
    );

    const order = rows[0];

    if (!order || order.RAZORPAY_ORDER_ID !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order verification failed.",
      });
    }

    if (order.PAYMENT_STATUS === "PAID") {
      return res.json({
        success: true,
        message: "Payment already verified.",
        orderId,
      });
    }

    const expectedSignature = createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET,
    )
      .update(`${order.RAZORPAY_ORDER_ID}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Signature validation alone is not enough:
    // confirm the payment is captured and belongs to this Razorpay order.
    const payment = await fetchRazorpayPayment(razorpay_payment_id);

    if (
      payment.order_id !== order.RAZORPAY_ORDER_ID ||
      payment.status !== "captured" ||
      Number(payment.amount) !== Math.round(Number(order.TOTAL_AMOUNT) * 100)
    ) {
      return res.status(409).json({
        success: false,
        message: "Payment is not captured or does not match this order.",
        paymentStatus: payment.status,
      });
    }

    await executeQuery(
      `UPDATE ORDERS
       SET PAYMENT_STATUS = 'PAID',
           ORDER_STATUS = 'CONFIRMED',
           RAZORPAY_PAYMENT_ID = ?,
           UPDATED_AT = CURRENT_TIMESTAMP()
       WHERE ORDER_ID = ?`,
      [razorpay_payment_id, orderId],
    );

    return res.json({
      success: true,
      message: "Payment verified and order confirmed.",
      orderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
};
