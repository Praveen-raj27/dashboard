
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderTrackingHistory } from "../../services/deliveryService";
import "./TrackOrder.css";

const STATUS_STEPS = [
  "ORDER_CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrderTrackingHistory(
          orderId,
          controller.signal
        );

        setHistory(data || []);
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

    fetchHistory();

    return () => controller.abort();
  }, [orderId]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="tracking-loader">
        <div className="tracking-spinner"></div>
        <p>Loading tracking details...</p>
        <span>Please wait while we fetch your order updates.</span>
      </div>
    );
  }

  if (error) {
    return <div className="tracking-message tracking-error">{error}</div>;
  }

  const completedStatuses = history.map((item) => item.STATUS);

  return (
    <main className="track-order-page">
      <button
        className="tracking-back-button"
        onClick={() => navigate("/my-orders")}
      >
        ← Back to My Orders
      </button>

      <div className="tracking-heading">
        <h1>Track Your Order</h1>
        <p>Order ID: {orderId}</p>
      </div>

      <section className="tracking-card">
        <h2>Delivery Progress</h2>

        <div className="tracking-timeline">
          {STATUS_STEPS.map((status) => {
            const event = history.find(
              (item) => item.STATUS === status
            );

            const completed = completedStatuses.includes(status);

            return (
              <div
                key={status}
                className={`tracking-step ${completed ? "completed" : ""}`}
              >
                <div className="tracking-indicator">
                  {completed ? "✓" : ""}
                </div>

                <div className="tracking-step-content">
                  <h3>{status.replaceAll("_", " ")}</h3>

                  {event && (
                    <>
                      <p>{event.DESCRIPTION}</p>
                      {event.LOCATION && <p>{event.LOCATION}</p>}
                      <span>{formatDate(event.CREATED_AT)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default TrackOrder;
