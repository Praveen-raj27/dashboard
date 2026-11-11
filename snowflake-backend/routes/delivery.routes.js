
import express from "express";

import {
  fetchCustomerOrders,
  fetchOrderDetails,
  fetchOrderTrackingHistory,
  fetchAllDeliveryOrders,
  assignDelivery,
  updateDelivery
} from "../controllers/delivery.controller.js";

import {
  authenticateUser,
  authorizeAdmin
} from "../middleware/auth.middleware.js";

const router = express.Router();

// All delivery routes require authentication
router.use(authenticateUser);

// GET all orders belonging to logged-in customer
router.get("/orders", fetchCustomerOrders);

// GET individual order details
router.get("/orders/:orderId", fetchOrderDetails);

// GET tracking history
router.get("/orders/:orderId/history", fetchOrderTrackingHistory);

// ADMIN: GET ALL CUSTOMER ORDERS
router.get(
  "/admin/orders",
  authorizeAdmin,
  fetchAllDeliveryOrders
);
router.patch(
  "/admin/orders/assign",
  authorizeAdmin,
  assignDelivery
);

router.patch(
  "/admin/orders/status",
  authorizeAdmin,
  updateDelivery
);
export default router;
