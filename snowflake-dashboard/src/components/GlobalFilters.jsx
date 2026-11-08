import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Filter, RotateCcw } from "lucide-react";

import { useFilters } from "../context/FilterContext";
import { getInventory } from "../services/salesService";

export default function GlobalFilters() {
  const location = useLocation();

  const { filters, updateFilters, resetFilters } = useFilters();

  const isInventoryPage = location.pathname
    .toLowerCase()
    .includes("inventory");

  const [localFilters, setLocalFilters] = useState(filters);
  const [allInventory, setAllInventory] = useState([]);

  // Fetch all inventory records for Category and Supplier options.
  useEffect(() => {
    const controller = new AbortController();

    const fetchFilterOptions = async () => {
      try {
        const data = await getInventory({}, controller.signal);
        setAllInventory(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Filter options error:", error);
        }
      }
    };

    fetchFilterOptions();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        allInventory.map((item) => item.CATEGORY).filter(Boolean)
      ),
    ].sort();
  }, [allInventory]);

  const suppliers = useMemo(() => {
    return [
      ...new Set(
        allInventory.map((item) => item.SUPPLIER).filter(Boolean)
      ),
    ].sort();
  }, [allInventory]);

  const statusField = isInventoryPage
    ? "stockStatus"
    : "paymentStatus";

  const statusOptions = isInventoryPage
    ? [
        { value: "IN_STOCK", label: "In Stock" },
        { value: "LOW_STOCK", label: "Low Stock" },
        { value: "OUT_OF_STOCK", label: "Out of Stock" },
      ]
    : [
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "FAILED", label: "Failed" },
      ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    updateFilters(localFilters);
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters({
      category: "",
      supplier: "",
      paymentStatus: "",
      stockStatus: "",
    });
  };

  return (
    <div className="global-filters">
      <div className="filter-heading">
        <div className="filter-heading-icon">
          <Filter size={17} />
        </div>

        <div>
          <h3>Filters</h3>
          <p>
            {isInventoryPage
              ? "Refine your inventory"
              : "Refine your sales data"}
          </p>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-field">
          <label>Category</label>

          <select
            name="category"
            value={localFilters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Supplier</label>

          <select
            name="supplier"
            value={localFilters.supplier}
            onChange={handleChange}
          >
            <option value="">All Suppliers</option>

            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>
            {isInventoryPage ? "Stock Status" : "Payment Status"}
          </label>

          <select
            name={statusField}
            value={localFilters[statusField]}
            onChange={handleChange}
          >
            <option value="">
              {isInventoryPage ? "All Stock Statuses" : "All Payments"}
            </option>

            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="filter-apply-btn"
            onClick={handleApply}
          >
            Apply Filters
          </button>

          <button
            type="button"
            className="filter-reset-btn"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}