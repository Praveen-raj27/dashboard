
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

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "Pending";

  if (loading) {
    return (
      <div className="orders-loader">
        <div className="orders-spinner"></div>
        <p>Loading your orders...</p>
        <span>Please wait while we fetch your orders.</span>
      </div>
    );
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

          <button type="button" onClick={() => navigate("/home")}>
            Explore Products
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.ORDER_ID}>
              {/* Order Header */}
              <div className="order-card-header">
                <div>
                  <span className="order-label">Order ID</span>
                  <h3>{order.ORDER_ID}</h3>
                </div>

                <span
                  className={`order-status ${String(
                    order.DELIVERY_STATUS || "pending"
                  ).toLowerCase()}`}
                >
                  {formatStatus(order.DELIVERY_STATUS)}
                </span>
              </div>

              {/* Order Information */}
              <div className="order-card-details">
                <div>
                  <span>Order date</span>
                  <strong>{formatDate(order.CREATED_AT)}</strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>{formatStatus(order.PAYMENT_STATUS)}</strong>
                </div>

                <div>
                  <span>Products</span>
                  <strong>{order.ITEMS?.length || 0}</strong>
                </div>
              </div>

              {/* Purchased Products */}
              <div className="order-products-section">
                <h4>Items Ordered</h4>

                {order.ITEMS?.length > 0 ? (
                  <div className="order-products-list">
                    {order.ITEMS.map((item) => (
                      <div
                        className="order-product"
                        key={item.ORDER_ITEM_ID || `${item.ORDER_ID}-${item.ITEM_ID}`}
                      >
                        <div className="order-product-image">
                          <span>📦</span>
                        </div>

                        <div className="order-product-info">
                          <strong>{item.ITEM_NAME}</strong>
                          <span>Item #{item.ITEM_ID}</span>
                          <span>Quantity: {item.QUANTITY}</span>
                        </div>

                        <div className="order-product-price">
                          <strong>
                            {formatCurrency(
                              item.LINE_TOTAL,
                              order.CURRENCY
                            )}
                          </strong>

                          <span>
                            {formatCurrency(
                              item.UNIT_PRICE,
                              order.CURRENCY
                            )} / item
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="order-no-items">
                    Product details unavailable.
                  </p>
                )}
              </div>

              {/* Order Total */}
              <div className="order-total-section">
                <span>Total Amount Paid</span>

                <strong>
                  {formatCurrency(
                    order.TOTAL_AMOUNT,
                    order.CURRENCY
                  )}
                </strong>
              </div>

              {/* Footer */}
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
                    navigate(`/track-order/${order.ORDER_ID}`)
                  }
                >
                  Track Order →
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
