import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Package,
  MapPin,
  CreditCard,
} from "lucide-react";

import { useSales } from "../../hooks/useSales";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const groupOrders = (sales = []) => {
  const orders = new Map();

  sales.forEach((item) => {
    if (!item.ORDER_ID) {
      console.warn("Sales record is missing ORDER_ID:", item);
      return;
    }

    if (!orders.has(item.ORDER_ID)) {
      orders.set(item.ORDER_ID, {
        orderId: item.ORDER_ID,
        customerName: item.CUSTOMER_NAME || "Unknown Customer",
        customerEmail: item.CUSTOMER_EMAIL || "",
        customerPhone: item.CUSTOMER_PHONE || "",
        shippingAddress: item.SHIPPING_ADDRESS || "",
        city: item.CITY || "",
        state: item.STATE || "",
        pincode: item.PINCODE || "",
        subtotal: Number(item.SUBTOTAL) || 0,
        totalAmount: Number(item.TOTAL_AMOUNT) || 0,
        currency: item.CURRENCY || "INR",
        orderStatus: item.ORDER_STATUS || "UNKNOWN",
        paymentStatus: item.PAYMENT_STATUS || "UNKNOWN",
        razorpayOrderId: item.RAZORPAY_ORDER_ID || "",
        razorpayPaymentId: item.RAZORPAY_PAYMENT_ID || "",
        createdAt: item.CREATED_AT || "",
        items: [],
      });
    }

    orders.get(item.ORDER_ID).items.push({
      orderItemId: item.ORDER_ITEM_ID || `${item.ORDER_ID}-${item.ITEM_ID}`,
      itemId: item.ITEM_ID,
      name: item.ITEM_NAME || "Unknown Product",
      category: item.CATEGORY || "-",
      supplier: item.SUPPLIER || "-",
      quantity: Number(item.QUANTITY) || 0,
      unitPrice: Number(item.UNIT_PRICE) || 0,
      lineTotal: Number(item.LINE_TOTAL) || 0,
    });
  });

  return [...orders.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

function Sales() {
  const { sales, loading, error } = useSales();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const orders = useMemo(() => groupOrders(sales), [sales]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [
          order.orderId,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.city,
          order.state,
          ...order.items.map((item) => item.name),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesPayment =
        paymentFilter === "ALL" ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [orders, search, paymentFilter]);

  const paidRevenue = orders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  if (loading) {
    return (
      <div className="page-message">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>Loading Sales</p>
          <span>Fetching your order records...</span>
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
          <div className="breadcrumb">Workspace / Sales</div>
          <h1>Sales Management</h1>
          <p>Manage customer orders and track payment activity.</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-heading">
            <span>Total Orders</span>
            <div className="stat-icon blue">
              <Package size={19} />
            </div>
          </div>
          <h2>{orders.length}</h2>
          <p className="stat-caption">All received orders</p>
        </div>

        <div className="stat-card">
          <div className="stat-heading">
            <span>Paid Revenue</span>
            <div className="stat-icon green">
              <CreditCard size={19} />
            </div>
          </div>
          <h2>{currency(paidRevenue)}</h2>
          <p className="stat-caption">Excludes pending payments</p>
        </div>

        <div className="stat-card">
          <div className="stat-heading">
            <span>Paid Orders</span>
            <div className="stat-icon purple">
              <Package size={19} />
            </div>
          </div>
          <h2>
            {orders.filter((order) => order.paymentStatus === "PAID").length}
          </h2>
          <p className="stat-caption">Successful payments</p>
        </div>

        <div className="stat-card">
          <div className="stat-heading">
            <span>Pending Payments</span>
            <div className="stat-icon orange">
              <CreditCard size={19} />
            </div>
          </div>
          <h2>
            {orders.filter((order) => order.paymentStatus === "PENDING").length}
          </h2>
          <p className="stat-caption">Awaiting payment completion</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>All Orders</h3>
            <p>{filteredOrders.length} orders found</p>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search order, customer, product or city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            aria-label="Filter by payment status"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>PRODUCTS</th>
                <th>LOCATION</th>
                <th>DATE</th>
                <th>PAYMENT</th>
                <th>ORDER STATUS</th>
                <th className="amount-column">TOTAL</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrder === order.orderId;

                return (
                  <>
                    <tr key={order.orderId}>
                      <td>
                        <strong>#{order.orderId.slice(0, 8)}</strong>
                      </td>

                      <td>
                        <strong>{order.customerName}</strong>
                        <p className="customer-subtext">
                          {order.customerEmail}
                        </p>
                        <p className="customer-subtext">
                          {order.customerPhone}
                        </p>
                      </td>

                      <td>
                        <strong>{order.items.length} item(s)</strong>
                        <p className="customer-subtext">
                          {order.items
                            .map((item) => item.name)
                            .join(", ")}
                        </p>
                      </td>

                      <td>
                        <div className="location-cell">
                          <MapPin size={14} />
                          {order.city}, {order.state}
                        </div>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            order.paymentStatus === "PAID"
                              ? "success"
                              : order.paymentStatus === "PENDING"
                              ? "pending"
                              : "failed"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            order.orderStatus === "CONFIRMED"
                              ? "success"
                              : "pending"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="amount-column">
                        <strong>{currency(order.totalAmount)}</strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="expand-order-btn"
                          onClick={() =>
                            setExpandedOrder(
                              isExpanded ? null : order.orderId
                            )
                          }
                          aria-label={
                            isExpanded ? "Hide order details" : "Show order details"
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${order.orderId}-details`}>
                        <td colSpan="9">
                          <div className="order-details">
                            <div className="order-details-grid">
                              <div>
                                <h4>Shipping Information</h4>
                                <p>{order.shippingAddress}</p>
                                <p>
                                  {order.city}, {order.state} - {order.pincode}
                                </p>
                              </div>

                              <div>
                                <h4>Payment Information</h4>
                                <p>
                                  Razorpay Order:{" "}
                                  {order.razorpayOrderId || "-"}
                                </p>
                                <p>
                                  Payment ID:{" "}
                                  {order.razorpayPaymentId || "Not paid yet"}
                                </p>
                              </div>

                              <div>
                                <h4>Order Summary</h4>
                                <p>Subtotal: {currency(order.subtotal)}</p>
                                <p>
                                  Total: <strong>{currency(order.totalAmount)}</strong>
                                </p>
                              </div>
                            </div>

                            <h4 className="order-items-heading">
                              Purchased Products
                            </h4>

                            <div className="table-wrapper">
                              <table className="sales-table order-items-table">
                                <thead>
                                  <tr>
                                    <th>PRODUCT</th>
                                    <th>CATEGORY</th>
                                    <th>SUPPLIER</th>
                                    <th>QUANTITY</th>
                                    <th>UNIT PRICE</th>
                                    <th className="amount-column">
                                      LINE TOTAL
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {order.items.map((item) => (
                                    <tr key={item.orderItemId}>
                                      <td>{item.name}</td>
                                      <td>{item.category || "-"}</td>
                                      <td>{item.supplier || "-"}</td>
                                      <td>{item.quantity}</td>
                                      <td>{currency(item.unitPrice)}</td>
                                      <td className="amount-column">
                                        <strong>{currency(item.lineTotal)}</strong>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-table">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default Sales;