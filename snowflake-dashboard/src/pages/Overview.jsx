
import { useMemo } from "react";
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Layers,
  Package,
  Activity,
} from "lucide-react";
import { useSales } from "../hooks/useSales";

function Overview() {
  const { sales, loading, error } = useSales();

  const totalRevenue = useMemo(
    () => sales.reduce((sum, item) => sum + Number(item.AMOUNT || 0), 0),
    [sales]
  );

  const averageOrder = sales.length
    ? totalRevenue / sales.length
    : 0;

  const categoryCount = useMemo(
    () => new Set(sales.map((item) => item.CATEGORY)).size,
    [sales]
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: "Across all sales records",
      Icon: IndianRupee,
      color: "purple",
    },
    {
      label: "Total Orders",
      value: sales.length.toLocaleString("en-IN"),
      description: "Total transactions",
      Icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(averageOrder),
      description: "Revenue per transaction",
      Icon: TrendingUp,
      color: "green",
    },
    {
      label: "Categories",
      value: categoryCount,
      description: "Active product categories",
      Icon: Layers,
      color: "orange",
    },
  ];

  if (loading) {
    return <div className="page-message">Loading overview...</div>;
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
          <p>Monitor your business performance and sales activity.</p>
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

      {/* KPI cards */}
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

      {/* Recent sales */}
      <section className="panel sales-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Sales</h3>
            <p>Explore and manage your sales transactions</p>
          </div>

          <span className="record-count">
            {sales.length} records
          </span>
        </div>

        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>REGION</th>
                <th>SALE DATE</th>
                <th className="amount-column">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {sales.slice(0, 5).map((item) => (
                <tr key={item.ID}>
                  <td>
                    <div className="product-cell">
                      <div className="product-avatar">
                        <Package size={16} />
                      </div>
                      <strong>{item.PRODUCT_NAME}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="category-badge">
                      {item.CATEGORY}
                    </span>
                  </td>

                  <td>{item.REGION}</td>

                  <td>
                    {item.SALE_DATE
                      ? new Date(item.SALE_DATE).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td className="amount-column">
                    <strong>
                      {formatCurrency(Number(item.AMOUNT || 0))}
                    </strong>
                  </td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No sales records available.
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
