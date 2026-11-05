
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import {
  ChartNoAxesCombined,
  MapPin,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

import MonthlyComparison from "../components/MonthlyComparison";

import { useSales } from "../hooks/useSales";


const CHART_COLORS = [
  "#155E59",
  "#55A28A",
  "#E9B96E",
  "#397F9A",
  "#8B79C9",
  "#D58A75",
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const compactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function Analytics() {
  const { sales, loading, error } = useSales();

  // Prepare chart data
  const {
    monthlyRevenue,
    categoryRevenue,
    regionRevenue,
    totalRevenue,
  } = useMemo(() => {
    const monthly = {};
    const categories = {};
    const regions = {};

    let total = 0;

    sales.forEach((sale) => {
      const amount = Number(sale.AMOUNT) || 0;

      total += amount;

      // Monthly revenue
      const date = String(sale.SALE_DATE ?? "");
      const monthKey = date.slice(0, 7);

      if (monthKey.length === 7) {
        monthly[monthKey] = (monthly[monthKey] || 0) + amount;
      }

      // Category revenue
      const category = sale.CATEGORY || "Unknown";
      categories[category] =
        (categories[category] || 0) + amount;

      // Region revenue
      const region = sale.REGION || "Unknown";
      regions[region] = (regions[region] || 0) + amount;
    });

    const monthlyData = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => ({
        month: new Date(`${key}-01T00:00:00`).toLocaleDateString(
          "en-IN",
          { month: "short", year: "2-digit" }
        ),
        revenue,
      }));

    const categoryData = Object.entries(categories)
      .map(([category, revenue]) => ({
        category,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const regionData = Object.entries(regions)
      .map(([region, revenue]) => ({
        region,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      monthlyRevenue: monthlyData,
      categoryRevenue: categoryData,
      regionRevenue: regionData,
      totalRevenue: total,
    };
  }, [sales]);

  if (loading) return <h2>Loading analytics...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <>
      <header className="topbar">
        <div>
          <div className="breadcrumb">
            Workspace / Analytics
          </div>
          <h1>Sales Analytics</h1>
          <p>Understand your business performance through data.</p>
        </div>
      </header>

      {/* Analytics Summary */}
      <section className="analytics-summary">
        <div className="analytics-summary-icon">
          <ChartNoAxesCombined size={24} />
        </div>

        <div>
          <span>Total Revenue</span>
          <h2>{currency(totalRevenue)}</h2>
          <p>Based on currently applied filters</p>
        </div>
      </section>
        <MonthlyComparison sales={sales} />
      {/* Charts */}
      <div className="charts-grid">

        {/* Monthly Revenue */}
        <section className="panel chart-panel monthly-chart">
          <div className="panel-header">
            <div>
              <h3>
                <TrendingUp size={17} />
                Revenue Trend
              </h3>
              <p>Monthly revenue performance</p>
            </div>
          </div>

          {monthlyRevenue.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyRevenue}
                  margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E6E4DB"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#929D96", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={compactCurrency}
                    tick={{ fill: "#929D96", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                  />

                  <Tooltip
                    formatter={(value) => currency(value)}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E6E4DB",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#155E59"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#155E59",
                      strokeWidth: 2,
                      stroke: "#FFFFFF",
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="chart-empty">No revenue data available.</p>
          )}
        </section>

        {/* Category Donut */}
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h3>
                <IndianRupee size={17} />
                Revenue by Category
              </h3>
              <p>Category-wise revenue contribution</p>
            </div>
          </div>

          {categoryRevenue.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => currency(value)}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="chart-empty">No category data available.</p>
          )}
        </section>

        {/* Region Bar Chart */}
        <section className="panel chart-panel region-chart">
          <div className="panel-header">
            <div>
              <h3>
                <MapPin size={17} />
                Revenue by Region
              </h3>
              <p>Compare revenue across regions</p>
            </div>
          </div>

          {regionRevenue.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionRevenue}
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#E6E4DB"
                  />

                  <XAxis
                    type="number"
                    tickFormatter={compactCurrency}
                    tick={{ fill: "#929D96", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="region"
                    tick={{ fill: "#66756E", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />

                  <Tooltip
                    formatter={(value) => currency(value)}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#155E59"
                    radius={[0, 6, 6, 0]}
                    barSize={25}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="chart-empty">No regional data available.</p>
          )}
        </section>

      </div>
    </>
  );
}

export default Analytics;
