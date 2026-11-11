
import {
  getCustomerOrders,
  getOrderDetails,
  getOrderTrackingHistory,
  getAllDeliveryOrders,
  assignDeliveryDetails,
  updateDeliveryStatus
} from "../services/delivery.service.js";



// 1. GET CUSTOMER ORDERS
export const fetchCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await getCustomerOrders(userId);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch customer orders.",
    });
  }
};

// 2. GET INDIVIDUAL ORDER DETAILS
export const fetchOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await getOrderDetails(userId, orderId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Fetch order details error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch order details.",
    });
  }
};

// 3. GET ORDER TRACKING HISTORY
export const fetchOrderTrackingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const trackingHistory = await getOrderTrackingHistory(
      userId,
      orderId
    );

    return res.status(200).json({
      success: true,
      count: trackingHistory.length,
      data: trackingHistory,
    });
  } catch (error) {
    console.error("Fetch tracking history error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch tracking history.",
    });
  }
};
// 4. GET ALL ORDERS FOR ADMIN
export const fetchAllDeliveryOrders = async (req, res) => {
  try {
    const orders = await getAllDeliveryOrders();

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Fetch all delivery orders error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch delivery orders.",
    });
  }
};


export const assignDelivery = async (req, res) => {
  try {
    const {
      orderId,
      deliveryPartner,
      trackingNumber,
      trackingUrl,
      estimatedDeliveryDate,
    } = req.body;

    if (
      !orderId ||
      !deliveryPartner ||
      !trackingNumber ||
      !estimatedDeliveryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Order ID, delivery partner, tracking number and estimated delivery date are required.",
      });
    }

    const result = await assignDeliveryDetails({
      orderId,
      deliveryPartner,
      trackingNumber,
      trackingUrl,
      estimatedDeliveryDate,
      adminId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery assigned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Assign delivery error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to assign delivery.",
    });
  }
};


export const updateDelivery = async (req, res) => {
  try {
    const {
      orderId,
      newStatus,
      description,
      location,
    } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID and new status are required.",
      });
    }

    const result = await updateDeliveryStatus({
      orderId,
      newStatus,
      description,
      location,
      adminId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Update delivery error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update delivery status.",
    });
  }
};

