
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerOrders } from "../../services/deliveryService";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomerOrders(controller.signal);
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

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  if (loading) {
    return <div className="orders-message">Loading your orders...</div>;
  }

  if (error) {
    return <div className="orders-message orders-error">{error}</div>;
  }

  return (
    <main className="my-orders-page">
      <div className="orders-heading">
        <div>
          <h1>My Orders</h1>
          <p>View your purchases and track deliveries.</p>
        </div>

        <span className="orders-count">
          {orders.length} Orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders yet</h2>
          <p>Your purchases will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article
              className="order-card"
              key={order.ORDER_ID}
            >
              <div className="order-card-header">
                <div>
                  <span className="order-label">Order ID</span>
                  <h3>{order.ORDER_ID}</h3>
                </div>

                <span
                  className={`order-status ${String(
                    order.DELIVERY_STATUS
                  ).toLowerCase()}`}
                >
                  {order.DELIVERY_STATUS?.replaceAll("_", " ")}
                </span>
              </div>

              <div className="order-card-details">
                <div>
                  <span>Order date</span>
                  <strong>{formatDate(order.CREATED_AT)}</strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>{order.PAYMENT_STATUS}</strong>
                </div>

                <div>
                  <span>Total amount</span>
                  <strong>
                    {formatCurrency(
                      order.TOTAL_AMOUNT,
                      order.CURRENCY
                    )}
                  </strong>
                </div>
              </div>

              <div className="order-card-footer">
                <div>
                  <span>Delivery partner</span>
                  <strong>
                    {order.DELIVERY_PARTNER || "Not assigned"}
                  </strong>
                </div>

                <button
                  type="button"
                  disabled={
                    order.PAYMENT_STATUS !== "PAID" ||
                    !order.DELIVERY_PARTNER
                  }
                  onClick={() =>
                    navigate(
                      `/track-order/${order.ORDER_ID}`
                    )
                  }
                >
                  Track Order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyOrders;
