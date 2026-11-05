
export function getMonthlyComparison(sales) {
  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const previousDate = new Date(
    currentYear,
    currentMonth - 1,
    1
  );

  const previousMonth = previousDate.getMonth();
  const previousYear = previousDate.getFullYear();

  const getMonthData = (month, year) => {
    return sales.reduce(
      (result, sale) => {
        // Handle Snowflake DATE values safely
        const dateString = String(sale.SALE_DATE ?? "").slice(0, 10);
        const [saleYear, saleMonth] = dateString.split("-").map(Number);

        if (
          saleYear === year &&
          saleMonth === month + 1
        ) {
          result.revenue += Number(sale.AMOUNT) || 0;
          result.orders += 1;
        }

        return result;
      },
      { revenue: 0, orders: 0 }
    );
  };

  const current = getMonthData(currentMonth, currentYear);

  const previous = getMonthData(previousMonth, previousYear);

  const getGrowth = (currentValue, previousValue) => {
    if (previousValue === 0) {
      return currentValue > 0 ? null : 0;
    }

    return (
      ((currentValue - previousValue) / previousValue) * 100
    );
  };

  return {
    current,
    previous,
    revenueGrowth: getGrowth(
      current.revenue,
      previous.revenue
    ),
    ordersGrowth: getGrowth(
      current.orders,
      previous.orders
    ),
  };
}
