import { useMemo } from "react";
import {
  IndianRupee,
  ShoppingCart,
  BadgeCheck,
  Package,
  Users,
  Activity,
} from "lucide-react";
import { useSales } from "../../hooks/useSales";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "-";

  // Snowflake returns timestamps like "2026-11-07 07:01:35.358"
  const date = new Date(String(value).replace(" ", "T"));

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const groupOrders = (sales) => {
  const orders = new Map();

  sales.forEach((item) => {
    if (!orders.has(item.ORDER_ID)) {
      orders.set(item.ORDER_ID, {
        orderId: item.ORDER_ID,
        customerName: item.CUSTOMER_NAME,
        customerEmail: item.CUSTOMER_EMAIL,
        city: item.CITY,
        state: item.STATE,
        totalAmount: Number(item.TOTAL_AMOUNT) || 0,
        orderStatus: item.ORDER_STATUS,
        paymentStatus: item.PAYMENT_STATUS,
        createdAt: item.CREATED_AT,
        items: [],
      });
    }

    orders.get(item.ORDER_ID).items.push({
      name: item.ITEM_NAME,
      quantity: Number(item.QUANTITY) || 0,
      lineTotal: Number(item.LINE_TOTAL) || 0,
    });
  });

  return [...orders.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

function Overview() {
  const { sales, loading, error } = useSales();

  const { orders, stats } = useMemo(() => {
    const groupedOrders = groupOrders(sales);

    const paidOrders = groupedOrders.filter(
      (order) => order.PAYMENT_STATUS === "PAID"
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const unitsSold = paidOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const customers = new Set(
      paidOrders.map((order) => order.customerEmail || order.customerName)
    );

    return {
      orders: groupedOrders,
      stats: [
        {
          label: "Total Revenue",
          value: currency(totalRevenue),
          description: "Revenue from successful payments",
          Icon: IndianRupee,
          color: "purple",
        },
        {
          label: "Total Orders",
          value: groupedOrders.length.toLocaleString("en-IN"),
          description: "All orders received",
          Icon: ShoppingCart,
          color: "blue",
        },
        {
          label: "Paid Orders",
          value: paidOrders.length.toLocaleString("en-IN"),
          description: "Successfully completed payments",
          Icon: BadgeCheck,
          color: "green",
        },
        {
          label: "Units Sold",
          value: unitsSold.toLocaleString("en-IN"),
          description: `${customers.size} unique paid customers`,
          Icon: Package,
          color: "orange",
        },
      ],
    };
  }, [sales]);

  if (loading) {
    return (
      <div className="page-message">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>Loading overview</p>
          <span>Fetching your order insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="page-message error">{error}</div>;
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="breadcrumb">Workspace / Overview</div>
          <h1>Sales Overview</h1>
          <p>Monitor your orders, revenue, and customer activity.</p>
        </div>

        <div className="topbar-right">
          <div className="live-indicator">
            <span className="status-dot" />
            Live data
          </div>

          <div className="date-label">
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map(({ label, value, description, Icon, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-heading">
              <span>{label}</span>
              <div className={`stat-icon ${color}`}>
                <Icon size={19} />
              </div>
            </div>

            <h2>{value}</h2>
            <p className="stat-caption">{description}</p>
          </div>
        ))}
      </section>

      <section className="panel sales-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Orders</h3>
            <p>Latest customer orders and payment activity</p>
          </div>

          <span className="record-count">
            {orders.length} orders
          </span>
        </div>

        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>PRODUCTS</th>
                <th>DATE</th>
                <th>PAYMENT</th>
                <th className="amount-column">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <strong>#{order?.orderId?.slice(0, 8)}</strong>
                  </td>

                  <td>
                    <div className="product-cell">
                      <div>
                        <strong>{order.customerName}</strong>
                        <p className="customer-subtext">
                          {order.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      {order.items.map((item, index) => (
                        <div key={`${item.name}-${index}`}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td>{formatDate(order.createdAt)}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        order.paymentStatus === "PAID" ? "success" : "pending"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="amount-column">
                    <strong>{currency(order.totalAmount)}</strong>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No orders available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>Snowlytics Analytics</span>
        <span>
          <Activity size={13} />
          Powered by React & Snowflake
        </span>
      </footer>
    </>
  );
}

export default Overview;