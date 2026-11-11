
import { useEffect, useState } from "react";
import {
  getAllDeliveryOrders,
  assignDeliveryDetails,
  updateDeliveryStatus,
} from "../../services/deliveryService";
import "./DeliveryManagement.css";

const NEXT_STATUS = {
  ORDER_CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const DeliveryManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [savingAction, setSavingAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [deliveryForm, setDeliveryForm] = useState({
    deliveryPartner: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedDeliveryDate: "",
  });

  const [statusForm, setStatusForm] = useState({
    newStatus: "",
    description: "",
    location: "",
  });

  // Open delivery management modal
  const openManageModal = (order) => {
    setSelectedOrder(order);
    setActionError("");
    setActionSuccess("");

    setDeliveryForm({
      deliveryPartner: order.DELIVERY_PARTNER || "",
      trackingNumber: order.TRACKING_NUMBER || "",
      trackingUrl: order.TRACKING_URL || "",
      estimatedDeliveryDate: order.ESTIMATED_DELIVERY_DATE
        ? order.ESTIMATED_DELIVERY_DATE.slice(0, 10)
        : "",
    });

    setStatusForm({
      newStatus: NEXT_STATUS[order.DELIVERY_STATUS] || "",
      description: "",
      location: "",
    });
  };

  // Close modal
  const closeManageModal = () => {
    if (savingAction) return;

    setSelectedOrder(null);
    setActionError("");
    setActionSuccess("");
  };

  // Refresh orders after admin actions
  const refreshOrders = async () => {
    const data = await getAllDeliveryOrders();
    const updatedOrders = data || [];

    setOrders(updatedOrders);

    const updatedSelectedOrder = updatedOrders.find(
      (order) => order.ORDER_ID === selectedOrder?.ORDER_ID
    );

    if (updatedSelectedOrder) {
      setSelectedOrder(updatedSelectedOrder);
    }

    return updatedSelectedOrder;
  };

  // Assign delivery partner
  const handleAssignDelivery = async (event) => {
    event.preventDefault();

    try {
      setSavingAction("assign");
      setActionError("");
      setActionSuccess("");

      await assignDeliveryDetails({
        orderId: selectedOrder.ORDER_ID,
        ...deliveryForm,
      });

      const updatedOrder = await refreshOrders();

      if (updatedOrder) {
        setStatusForm({
          newStatus: NEXT_STATUS[updatedOrder.DELIVERY_STATUS] || "",
          description: "",
          location: "",
        });
      }

      setActionSuccess("Delivery partner assigned successfully.");
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSavingAction(null);
    }
  };

  // Update delivery status
  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    try {
      setSavingAction("status");
      setActionError("");
      setActionSuccess("");

      await updateDeliveryStatus({
        orderId: selectedOrder.ORDER_ID,
        ...statusForm,
      });

      const updatedOrder = await refreshOrders();

      if (updatedOrder) {
        setStatusForm({
          newStatus: NEXT_STATUS[updatedOrder.DELIVERY_STATUS] || "",
          description: "",
          location: "",
        });
      }

      setActionSuccess("Delivery status updated successfully.");
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSavingAction(null);
    }
  };

  // Fetch all delivery orders
  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllDeliveryOrders(controller.signal);

        setOrders(data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, []);

  // Formatting helpers
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "Unknown";

  return (
    <main className="delivery-management-page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Delivery Management</h1>
          <p>
            Manage orders, assign delivery partners and track shipments.
          </p>
        </div>

        <div className="delivery-total-count">
          {orders.length} Orders
        </div>
      </div>

      {/* Delivery Statistics */}
      <div className="delivery-stats">

        <div className="delivery-stat-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="delivery-stat-card">
          <span>Ready to Pack</span>
          <h2>
            {
              orders.filter(
                (order) =>
                  order.PAYMENT_STATUS === "PAID" &&
                  order.DELIVERY_STATUS === "ORDER_CONFIRMED"
              ).length
            }
          </h2>
        </div>

        <div className="delivery-stat-card">
          <span>In Transit</span>
          <h2>
            {
              orders.filter((order) =>
                ["SHIPPED", "OUT_FOR_DELIVERY"].includes(
                  order.DELIVERY_STATUS
                )
              ).length
            }
          </h2>
        </div>

        <div className="delivery-stat-card">
          <span>Delivered</span>
          <h2>
            {
              orders.filter(
                (order) => order.DELIVERY_STATUS === "DELIVERED"
              ).length
            }
          </h2>
        </div>

      </div>

      {/* Orders Table */}
      <section className="delivery-orders-section">

        <div className="delivery-section-header">
          <div>
            <h2>All Orders</h2>
            <p>View and manage customer deliveries.</p>
          </div>
        </div>

        {loading ? (
          <div className="delivery-message">
            Loading delivery orders...
          </div>
        ) : error ? (
          <div className="delivery-message delivery-error">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="delivery-message">
            No orders found.
          </div>
        ) : (
          <div className="delivery-table-wrapper">
            <table className="delivery-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Delivery Status</th>
                  <th>Delivery Partner</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.ORDER_ID}>

                    <td>
                      <strong>
                        #{order.ORDER_ID.slice(0, 8)}
                      </strong>
                    </td>

                    <td>
                      <div className="delivery-customer">
                        <strong>{order.CUSTOMER_NAME}</strong>
                        <span>{order.CUSTOMER_EMAIL}</span>
                      </div>
                    </td>

                    <td>{formatDate(order.CREATED_AT)}</td>

                    <td>
                      <strong>
                        {formatCurrency(order.TOTAL_AMOUNT)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`delivery-badge ${String(
                          order.PAYMENT_STATUS || ""
                        ).toLowerCase()}`}
                      >
                        {order.PAYMENT_STATUS || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`delivery-badge status-${String(
                          order.DELIVERY_STATUS || ""
                        ).toLowerCase()}`}
                      >
                        {formatStatus(order.DELIVERY_STATUS)}
                      </span>
                    </td>

                    <td>
                      {order.DELIVERY_PARTNER || "Not assigned"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="manage-delivery-btn"
                        onClick={() => openManageModal(order)}
                      >
                        Manage
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>

      {/* Delivery Management Modal */}
      {selectedOrder && (
        <div className="delivery-modal-overlay">

          <div className="delivery-modal">

            {/* Modal Header */}
            <div className="delivery-modal-header">
              <div>
                <h2>Manage Delivery</h2>
                <p>
                  Order #{selectedOrder.ORDER_ID.slice(0, 8)}
                </p>
              </div>

              <button
                type="button"
                className="delivery-modal-close"
                onClick={closeManageModal}
                disabled={savingAction !== null}
              >
                ×
              </button>
            </div>

            {/* Order Summary */}
            <div className="delivery-order-summary">
              <strong>{selectedOrder.CUSTOMER_NAME}</strong>

              <span>{selectedOrder.CUSTOMER_EMAIL}</span>

              <span>
                {selectedOrder.SHIPPING_ADDRESS},{" "}
                {selectedOrder.CITY}, {selectedOrder.STATE} -{" "}
                {selectedOrder.PINCODE}
              </span>

              <strong>
                {formatCurrency(selectedOrder.TOTAL_AMOUNT)}
              </strong>
            </div>

            {selectedOrder.PAYMENT_STATUS !== "PAID" ? (

              <p className="delivery-warning">
                Delivery cannot be assigned until payment is completed.
              </p>

            ) : (

              <>

                {/* Delivery Assignment */}
                {!selectedOrder.DELIVERY_PARTNER && (
                  <form onSubmit={handleAssignDelivery}>

                    <h3>Delivery Assignment</h3>

                    <label>Delivery Partner</label>
                    <input
                      value={deliveryForm.deliveryPartner}
                      onChange={(e) =>
                        setDeliveryForm((previous) => ({
                          ...previous,
                          deliveryPartner: e.target.value,
                        }))
                      }
                      placeholder="e.g. BlueDart"
                      required
                      disabled={savingAction !== null}
                    />

                    <label>Tracking Number</label>
                    <input
                      value={deliveryForm.trackingNumber}
                      onChange={(e) =>
                        setDeliveryForm((previous) => ({
                          ...previous,
                          trackingNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter tracking number"
                      required
                      disabled={savingAction !== null}
                    />

                    <label>Tracking URL</label>
                    <input
                      type="url"
                      value={deliveryForm.trackingUrl}
                      onChange={(e) =>
                        setDeliveryForm((previous) => ({
                          ...previous,
                          trackingUrl: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      disabled={savingAction !== null}
                    />

                    <label>Estimated Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryForm.estimatedDeliveryDate}
                      onChange={(e) =>
                        setDeliveryForm((previous) => ({
                          ...previous,
                          estimatedDeliveryDate: e.target.value,
                        }))
                      }
                      required
                      disabled={savingAction !== null}
                    />

                    <button
                      type="submit"
                      className="delivery-primary-btn"
                      disabled={savingAction !== null}
                    >
                      {savingAction === "assign"
                        ? "Assigning..."
                        : "Assign Delivery Partner"}
                    </button>

                  </form>
                )}

                {/* Assigned Delivery Details */}
                {selectedOrder.DELIVERY_PARTNER && (
                  <div className="delivery-assigned-info">

                    <h3>Delivery Partner Assigned</h3>

                    <p>
                      <strong>Partner:</strong>{" "}
                      {selectedOrder.DELIVERY_PARTNER}
                    </p>

                    <p>
                      <strong>Tracking Number:</strong>{" "}
                      {selectedOrder.TRACKING_NUMBER || "—"}
                    </p>

                    <p>
                      <strong>Estimated Delivery:</strong>{" "}
                      {formatDate(
                        selectedOrder.ESTIMATED_DELIVERY_DATE
                      )}
                    </p>

                    {selectedOrder.TRACKING_URL && (
                      <a
                        href={selectedOrder.TRACKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Track Shipment
                      </a>
                    )}

                  </div>
                )}

                <div className="delivery-modal-divider" />

                {/* Update Delivery Status */}
                {selectedOrder.DELIVERY_PARTNER &&
                  selectedOrder.DELIVERY_STATUS !== "DELIVERED" && (
                    <form onSubmit={handleStatusUpdate}>

                      <h3>Update Delivery Status</h3>

                      <p className="delivery-current-status">
                        Current status:{" "}
                        <strong>
                          {formatStatus(selectedOrder.DELIVERY_STATUS)}
                        </strong>
                      </p>

                      <label>Next Status</label>
                      <select
                        value={statusForm.newStatus}
                        onChange={(e) =>
                          setStatusForm((previous) => ({
                            ...previous,
                            newStatus: e.target.value,
                          }))
                        }
                        required
                        disabled={savingAction !== null}
                      >
                        <option value="">
                          Select next status
                        </option>

                        {NEXT_STATUS[selectedOrder.DELIVERY_STATUS] && (
                          <option
                            value={
                              NEXT_STATUS[selectedOrder.DELIVERY_STATUS]
                            }
                          >
                            {formatStatus(
                              NEXT_STATUS[selectedOrder.DELIVERY_STATUS]
                            )}
                          </option>
                        )}
                      </select>

                      <label>Description</label>
                      <textarea
                        value={statusForm.description}
                        onChange={(e) =>
                          setStatusForm((previous) => ({
                            ...previous,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter delivery update"
                        required
                        disabled={savingAction !== null}
                      />

                      <label>Current Location</label>
                      <input
                        value={statusForm.location}
                        onChange={(e) =>
                          setStatusForm((previous) => ({
                            ...previous,
                            location: e.target.value,
                          }))
                        }
                        placeholder="e.g. Chennai Warehouse"
                        required
                        disabled={savingAction !== null}
                      />

                      <button
                        type="submit"
                        className="delivery-primary-btn"
                        disabled={
                          savingAction !== null ||
                          !statusForm.newStatus
                        }
                      >
                        {savingAction === "status"
                          ? "Updating..."
                          : "Update Status"}
                      </button>

                    </form>
                  )}

                {/* Delivered Confirmation */}
                {selectedOrder.DELIVERY_STATUS === "DELIVERED" && (
                  <p className="delivery-action-success">
                    This order has been successfully delivered.
                  </p>
                )}

              </>
            )}

            {/* Action Feedback */}
            {actionError && (
              <p className="delivery-action-error">
                {actionError}
              </p>
            )}

            {actionSuccess && (
              <p className="delivery-action-success">
                {actionSuccess}
              </p>
            )}

          </div>
        </div>
      )}

    </main>
  );
};

export default DeliveryManagement;
