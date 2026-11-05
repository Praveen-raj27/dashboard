
import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";

import { getMonthlyComparison } from "../utils/salesAnalytics";

export default function MonthlyComparison({ sales = [] }) {
  const comparison = useMemo(
    () => getMonthlyComparison(sales),
    [sales]
  );

  const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const getMonthName = (offset = 0) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset);

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const Growth = ({ value }) => {
    if (value === null) {
      return <span className="growth-neutral">New</span>;
    }

    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <span className={isPositive ? "growth-positive" : "growth-negative"}>
        <Icon size={14} />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const cards = [
    {
      title: `${getMonthName()} Revenue`,
      value: currency(comparison.current.revenue),
      previous: `Previous: ${currency(comparison.previous.revenue)}`,
      growth: comparison.revenueGrowth,
      icon: IndianRupee,
    },
    {
      title: `${getMonthName()} Orders`,
      value: comparison.current.orders,
      previous: `Previous: ${comparison.previous.orders} orders`,
      growth: comparison.ordersGrowth,
      icon: ShoppingCart,
    },
  ];

  return (
    <section className="comparison-section">
      <div className="comparison-heading">
        <div>
          <h3>Monthly Performance</h3>
          <p>Compared with {getMonthName(-1)}</p>
        </div>
      </div>

      <div className="comparison-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="comparison-card" key={card.title}>
              <div className="comparison-card-top">
                <div className="comparison-icon">
                  <Icon size={19} />
                </div>

                <Growth value={card.growth} />
              </div>

              <span>{card.title}</span>
              <h2>{card.value}</h2>
              <p>{card.previous}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
