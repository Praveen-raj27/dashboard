
import { useEffect, useState } from "react";
import { CalendarDays, Filter, RotateCcw } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { getSales } from "../services/salesService";

export default function GlobalFilters() {
  const { filters, updateFilters, resetFilters } = useFilters();

  const [localFilters, setLocalFilters] = useState(filters);
  const [allSales, setAllSales] = useState([]);

  // Fetch complete dataset for dropdown options
  useEffect(() => {
    const controller = new AbortController();

    getSales({}, controller.signal)
      .then(setAllSales)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Filter options error:", err);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const categories = [
    ...new Set(allSales.map((sale) => sale.CATEGORY).filter(Boolean)),
  ];

  const regions = [
    ...new Set(allSales.map((sale) => sale.REGION).filter(Boolean)),
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
      startDate: "",
      endDate: "",
      category: "",
      region: "",
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
          <p>Refine your sales data</p>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-field">
          <label>Start Date</label>
          <div className="filter-input">
            <CalendarDays size={15} />
            <input
              type="date"
              name="startDate"
              value={localFilters.startDate}
              max={localFilters.endDate || undefined}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="filter-field">
          <label>End Date</label>
          <div className="filter-input">
            <CalendarDays size={15} />
            <input
              type="date"
              name="endDate"
              value={localFilters.endDate}
              min={localFilters.startDate || undefined}
              onChange={handleChange}
            />
          </div>
        </div>

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
          <label>Region</label>
          <select
            name="region"
            value={localFilters.region}
            onChange={handleChange}
          >
            <option value="">All Regions</option>

            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="filter-apply-btn"
            onClick={handleApply}
          >
            Apply Filters
          </button>

          <button
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
