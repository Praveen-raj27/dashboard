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
  Package,
  ShoppingCart,
} from "lucide-react";

import { useSales } from "../../hooks/useSales";

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
  }).format(value || 0);

const compactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const groupOrders = (sales) => {
  const orders = new Map();

  sales.forEach((item) => {
    if (!orders.has(item.ORDER_ID)) {
      orders.set(item.ORDER_ID, {
        orderId: item.ORDER_ID,
        totalAmount: Number(item.TOTAL_AMOUNT) || 0,
        paymentStatus: item.PAYMENT_STATUS,
        createdAt: item.CREATED_AT,
        city: item.CITY || "Unknown",
        state: item.STATE || "Unknown",
      });
    }
  });

  return [...orders.values()];
};

function Analytics() {
  const { sales, loading, error } = useSales();

  const analytics = useMemo(() => {
    const orders = groupOrders(sales);
    const paidOrders = orders.filter(
      (order) => order.paymentStatus === "PAID"
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const paidOrderIds = new Set(
      paidOrders.map((order) => order.orderId)
    );

    const totalUnits = sales.reduce((sum, item) => {
      if (!paidOrderIds.has(item.ORDER_ID)) return sum;
      return sum + (Number(item.QUANTITY) || 0);
    }, 0);

    const monthly = {};
    const categories = {};
    const cities = {};
    const products = {};

    sales.forEach((item) => {
      if (item.PAYMENT_STATUS !== "PAID") return;

      const amount = Number(item.LINE_TOTAL) || 0;
      const quantity = Number(item.QUANTITY) || 0;

      // Revenue by month
      const date = String(item.CREATED_AT || "");
      const monthKey = date.slice(0, 7);

      if (monthKey.length === 7) {
        monthly[monthKey] = (monthly[monthKey] || 0) + amount;
      }

      // Revenue by category
      const category = item.CATEGORY || "Unknown";
      categories[category] = (categories[category] || 0) + amount;

      // Revenue by city
      const city = item.CITY || "Unknown";
      cities[city] = (cities[city] || 0) + amount;

      // Product performance
      const product = item.ITEM_NAME || "Unknown";

      if (!products[product]) {
        products[product] = {
          product,
          revenue: 0,
          quantity: 0,
        };
      }

      products[product].revenue += amount;
      products[product].quantity += quantity;
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
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const cityData = Object.entries(cities)
      .map(([city, revenue]) => ({ city, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const productData = Object.values(products)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const uniqueCustomers = new Set(
      sales
        .filter((item) => item.PAYMENT_STATUS === "PAID")
        .map((item) => item.CUSTOMER_EMAIL || item.CUSTOMER_NAME)
    );

    const paymentRate = orders.length
      ? (paidOrders.length / orders.length) * 100
      : 0;

    return {
      totalRevenue,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      totalUnits,
      averageOrder: paidOrders.length
        ? totalRevenue / paidOrders.length
        : 0,
      customerCount: uniqueCustomers.size,
      paymentRate,
      monthlyRevenue: monthlyData,
      categoryRevenue: categoryData,
      cityRevenue: cityData,
      topProducts: productData,
    };
  }, [sales]);

  if (loading) {
    return (
      <div className="page-message">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>Loading Analytics</p>
          <span>Fetching your sales insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="page-message error">{error}</div>;
  }

  const summary = [
    {
      label: "Total Revenue",
      value: currency(analytics.totalRevenue),
      Icon: IndianRupee,
    },
    {
      label: "Paid Orders",
      value: analytics.paidOrders,
      Icon: ShoppingCart,
    },
    {
      label: "Average Order Value",
      value: currency(analytics.averageOrder),
      Icon: TrendingUp,
    },
    {
      label: "Payment Success",
      value: `${analytics.paymentRate.toFixed(1)}%`,
      Icon: ChartNoAxesCombined,
    },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <div className="breadcrumb">Workspace / Analytics</div>
          <h1>Sales Analytics</h1>
          <p>Understand your business performance through order data.</p>
        </div>
      </header>

      <section className="stats-grid">
        {summary.map(({ label, value, Icon }, index) => (
          <div className="stat-card" key={label}>
            <div className="stat-heading">
              <span>{label}</span>
              <div className={`stat-icon ${["purple", "blue", "green", "orange"][index]}`}>
                <Icon size={19} />
              </div>
            </div>
            <h2>{value}</h2>
            <p className="stat-caption">Based on applied filters</p>
          </div>
        ))}
      </section>

      <section className="analytics-summary">
        <div className="analytics-summary-icon">
          <ChartNoAxesCombined size={24} />
        </div>
        <div>
          <span>Business Performance</span>
          <h2>{analytics.totalUnits} units sold</h2>
          <p>
            {analytics.customerCount} unique customers ·{" "}
            {analytics.totalOrders} total orders
          </p>
        </div>
      </section>

      <div className="charts-grid">
        {/* Revenue trend */}
        <section className="panel chart-panel monthly-chart">
          <div className="panel-header">
            <div>
              <h3>
                <TrendingUp size={17} />
                Revenue Trend
              </h3>
              <p>Monthly revenue from paid orders</p>
            </div>
          </div>

          {analytics.monthlyRevenue.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyRevenue}>
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
                    dot={{ r: 4, fill: "#155E59" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="chart-empty">No revenue data available.</p>
          )}
        </section>

        {/* Category revenue */}
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

          {analytics.categoryRevenue.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {analytics.categoryRevenue.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => currency(value)} />
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

        {/* City revenue */}
        <section className="panel chart-panel region-chart">
          <div className="panel-header">
            <div>
              <h3>
                <MapPin size={17} />
                Revenue by City
              </h3>
              <p>Compare revenue across customer locations</p>
            </div>
          </div>

          {analytics.cityRevenue.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.cityRevenue}
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
                    dataKey="city"
                    tick={{ fill: "#66756E", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                  />
                  <Tooltip formatter={(value) => currency(value)} />
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
            <p className="chart-empty">No location data available.</p>
          )}
        </section>

        {/* Top products */}
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h3>
                <Package size={17} />
                Top Selling Products
              </h3>
              <p>Ranked by units sold from paid orders</p>
            </div>
          </div>

          {analytics.topProducts.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topProducts}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#E6E4DB"
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#929D96", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="product"
                    tick={{ fill: "#66756E", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "Revenue"
                        ? currency(value)
                        : `${value} units`
                    }
                  />
                  <Bar
                    dataKey="quantity"
                    name="Units"
                    fill="#55A28A"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="chart-empty">No product data available.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default Analytics;