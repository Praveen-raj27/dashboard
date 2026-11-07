
import { useEffect, useMemo, useCallback, useState } from "react";
import { getInventory } from "../../services/salesService";
import { useFilters } from "../../context/FilterContext";
import "./Admin.css";

function Inventory() {
  const { filters } = useFilters();

  const { startDate, endDate, category: globalCategory } = filters;

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchInventory = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const result = await getInventory(
        {
          startDate,
          endDate,
          category: globalCategory,
        },
        signal
      );

      const records = Array.isArray(result)
        ? result
        : result?.data || [];

      setInventory(records);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Inventory fetch error:", err);
        setError("Unable to load inventory. Please try again.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [startDate, endDate, globalCategory]);

  useEffect(() => {
    const controller = new AbortController();

    fetchInventory(controller.signal);

    return () => controller.abort();
  }, [fetchInventory]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        inventory
          .map((item) => item.CATEGORY)
          .filter(Boolean)
      ),
    ];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const searchValue = search.toLowerCase();

      return [
        item.ITEM_ID,
        item.ITEM_NAME,
        item.CATEGORY,
        item.SUPPLIER,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(searchValue)
      );
    });
  }, [inventory, search]);

  const totalProducts = inventory.length;

  const totalStock = inventory.reduce(
    (total, item) => total + Number(item.QUANTITY || 0),
    0
  );

  const lowStock = inventory.filter(
    (item) =>
      Number(item.QUANTITY) > 0 &&
      Number(item.QUANTITY) <= 10
  ).length;

  const outOfStock = inventory.filter(
    (item) => Number(item.QUANTITY) <= 0
  ).length;

  const inventoryValue = inventory.reduce(
    (total, item) =>
      total +
      Number(item.QUANTITY || 0) *
        Number(item.UNIT_PRICE || 0),
    0
  );

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStockStatus = (quantity) => {
    const stock = Number(quantity || 0);

    if (stock <= 0) {
      return { label: "Out of stock", className: "out" };
    }

    if (stock <= 10) {
      return { label: "Low stock", className: "low" };
    }

    return { label: "In stock", className: "available" };
  };

  if (loading) {
    return (
      <div className="inventory-message">
        <div className="inventory-loader" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-message">
        <p>{error}</p>
        <button onClick={() => fetchInventory()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <span className="inventory-eyebrow">
            ADMINISTRATION
          </span>
          <h1>Inventory</h1>
          <p>Manage and monitor your product inventory.</p>
        </div>

        <button
          className="inventory-refresh"
          onClick={() => fetchInventory()}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="inventory-stats">
        <div className="inventory-stat-card">
          <span className="inventory-stat-label">
            Total Products
          </span>
          <h2>{totalProducts}</h2>
          <span className="inventory-stat-caption">
            Products in inventory
          </span>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-label">
            Total Stock
          </span>
          <h2>{totalStock.toLocaleString("en-IN")}</h2>
          <span className="inventory-stat-caption">
            Available units
          </span>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-label">
            Low Stock
          </span>
          <h2 className="inventory-warning-value">
            {lowStock}
          </h2>
          <span className="inventory-stat-caption">
            Products needing restock
          </span>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-label">
            Out of Stock
          </span>
          <h2 className="inventory-danger-value">
            {outOfStock}
          </h2>
          <span className="inventory-stat-caption">
            Products unavailable
          </span>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-label">
            Inventory Value
          </span>
          <h2>{formatPrice(inventoryValue)}</h2>
          <span className="inventory-stat-caption">
            Estimated stock value
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <section className="inventory-table-section">
        <div className="inventory-table-heading">
          <div>
            <h2>All Products</h2>
            <p>
              Showing {filteredInventory.length} of {totalProducts} products
            </p>
          </div>
        </div>

        <div className="inventory-toolbar">
          <div className="inventory-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search product, ID or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Supplier</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item.QUANTITY);

                  return (
                    <tr key={item.ITEM_ID}>
                      <td className="inventory-id">
                        #{item.ITEM_ID}
                      </td>

                      <td className="inventory-product-name">
                        {item.ITEM_NAME || "-"}
                      </td>

                      <td>
                        <span className="inventory-category">
                          {item.CATEGORY || "-"}
                        </span>
                      </td>

                      <td>
                        {Number(item.QUANTITY || 0)}
                      </td>

                      <td>
                        {formatPrice(item.UNIT_PRICE)}
                      </td>

                      <td>{item.SUPPLIER || "-"}</td>

                      <td className="inventory-value">
                        {formatPrice(
                          Number(item.QUANTITY || 0) *
                            Number(item.UNIT_PRICE || 0)
                        )}
                      </td>

                      <td>
                        <span
                          className={`inventory-status ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td>{formatDate(item.CREATED_AT)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="inventory-empty">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Inventory;
