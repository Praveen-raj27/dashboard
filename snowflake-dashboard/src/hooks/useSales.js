import { useEffect, useState } from "react";
import { getSales } from "../services/salesService";
import { useFilters } from "../context/FilterContext";

export function useSales() {
  const { filters } = useFilters();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { category, supplier, paymentStatus } = filters;

  useEffect(() => {
    const controller = new AbortController();

    const fetchSales = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSales(
          {
            category,
            supplier,
            paymentStatus,
          },
          controller.signal
        );

        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch sales data");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSales();

    return () => controller.abort();
  }, [category, supplier, paymentStatus]);

  return { sales, loading, error };
}