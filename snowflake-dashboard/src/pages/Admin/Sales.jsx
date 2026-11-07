
import { useMemo, useState } from "react";
import { useSales } from "../../hooks/useSales";

function Sales() {
  const { sales, loading, error } = useSales();
  const [search, setSearch] = useState("");

  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      return (
        item.PRODUCT_NAME?.toLowerCase().includes(search.toLowerCase()) ||
        item.REGION?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [sales, search]);

  const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  if (loading) return <div className="page-message">
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <p>Loading Sales</p>
      <span>Fetching your sales insights...</span>
    </div>
  </div>
  if (error) return <h2>{error}</h2>;

  return (
    <>
      <header className="topbar">
        <div>
          <div className="breadcrumb">Workspace / Sales</div>
          <h1>Sales Management</h1>
          <p>View and search all sales transactions.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>All Transactions</h3>
            <p>{filteredSales.length} records found</p>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <input
              placeholder="Search product or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>REGION</th>
                <th>SALE DATE</th>
                <th className="amount-column">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((item) => (
                <tr key={item.ID}>
                  <td>{item.ID}</td>
                  <td>{item.PRODUCT_NAME}</td>
                  <td>{item.CATEGORY}</td>
                  <td>{item.REGION}</td>
                  <td>{String(item.SALE_DATE ?? "-")}</td>
                  <td className="amount-column">
                    <strong>{currency(Number(item.AMOUNT))}</strong>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No sales records found.
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
