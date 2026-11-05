
import { useMemo } from "react";
import {
  ChartNoAxesCombined,
  MapPin,
  IndianRupee,
} from "lucide-react";

import { useSales } from "../hooks/useSales";

function Analytics() {
  const { sales, loading, error } = useSales();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  // Calculate revenue by category
  const categoryRevenue = useMemo(() => {
    const totals = {};

    sales.forEach((item) => {
      const category = item.CATEGORY || "Unknown";

      totals[category] =
        (totals[category] || 0) + Number(item.AMOUNT || 0);
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [sales]);

  // Calculate revenue by region
  const regionRevenue = useMemo(() => {
    const totals = {};

    sales.forEach((item) => {
      const region = item.REGION || "Unknown";

      totals[region] =
        (totals[region] || 0) + Number(item.AMOUNT || 0);
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [sales]);

  // Calculate total revenue
  const totalRevenue = useMemo(
    () =>
      sales.reduce(
        (sum, item) => sum + Number(item.AMOUNT || 0),
        0
      ),
    [sales]
  );

  const maxCategoryRevenue = Math.max(
    ...categoryRevenue.map((item) => item.amount),
    1
  );

  const maxRegionRevenue = Math.max(
    ...regionRevenue.map((item) => item.amount),
    1
  );

  if (loading) {
    return <div className="page-message">Loading analytics...</div>;
  }

  if (error) {
    return <div className="page-message error">{error}</div>;
  }

  return (
    <>
      {/* Page Header */}
      <header className="topbar">
        <div>
          <div className="breadcrumb">Workspace / Analytics</div>
          <h1>Sales Analytics</h1>
          <p>
            Understand your revenue distribution and regional performance.
          </p>
        </div>

        <div className="live-indicator">
          <span className="status-dot" />
          Live data
        </div>
      </header>

      {/* Analytics Summary */}
      <section className="analytics-summary">
        <div className="analytics-summary-icon">
          <ChartNoAxesCombined size={22} />
        </div>

        <div>
          <span>Total Revenue Analyzed</span>
          <h2>{formatCurrency(totalRevenue)}</h2>
          <p>Based on {sales.length} sales transactions</p>
        </div>
      </section>

      {/* Two-column Analytics Layout */}
      <div className="analytics-grid">

        {/* Revenue by Category */}
        <section className="panel analytics-panel">
          <div className="panel-header">
            <div>
              <div className="analytics-title">
                <IndianRupee size={18} />
                <h3>Revenue by Category</h3>
              </div>

              <p>Sales distribution across product categories</p>
            </div>

            <span className="panel-tag">Category</span>
          </div>

          <div className="bar-chart">
            {categoryRevenue.map((item) => (
              <div className="bar-row" key={item.name}>
                <div className="bar-label">{item.name}</div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${
                        (item.amount / maxCategoryRevenue) * 100
                      }%`,
                    }}
                  />
                </div>

                <strong>{formatCurrency(item.amount)}</strong>
              </div>
            ))}

            {categoryRevenue.length === 0 && (
              <p className="empty-message">
                No category data available.
              </p>
            )}
          </div>
        </section>

        {/* Revenue by Region */}
        <section className="panel analytics-panel">
          <div className="panel-header">
            <div>
              <div className="analytics-title">
                <MapPin size={18} />
                <h3>Revenue by Region</h3>
              </div>

              <p>Regional revenue contribution and performance</p>
            </div>

            <span className="panel-tag">Region</span>
          </div>

          <div className="region-list">
            {regionRevenue.map((item, index) => {
              const percentage = totalRevenue
                ? (item.amount / totalRevenue) * 100
                : 0;

              return (
                <div className="region-row" key={item.name}>
                  <div className="region-top">
                    <div className="region-info">
                      <div
                        className={`region-number region-${index % 4}`}
                      >
                        {item.name.charAt(0)}
                      </div>

                      <span>{item.name}</span>
                    </div>

                    <div className="region-value">
                      <strong>
                        {formatCurrency(item.amount)}
                      </strong>

                      <small>{percentage.toFixed(1)}%</small>
                    </div>
                  </div>

                  <div className="region-track">
                    <div
                      className="region-fill"
                      style={{
                        width: `${
                          (item.amount / maxRegionRevenue) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {regionRevenue.length === 0 && (
              <p className="empty-message">
                No regional data available.
              </p>
            )}
          </div>
        </section>

      </div>
    </>
  );
}

export default Analytics;
