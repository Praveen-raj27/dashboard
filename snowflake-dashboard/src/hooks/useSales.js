
import { useEffect, useState } from "react";
import { getSales } from "../services/salesService";
import { useFilters } from "../context/FilterContext";

export function useSales() {
  const { filters } = useFilters();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { startDate, endDate, category, region } = filters;

  useEffect(() => {
    const controller = new AbortController();

    const fetchSales = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSales(
          { startDate, endDate, category, region },
          controller.signal
        );

        setSales(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSales();

    return () => controller.abort();
  }, [startDate, endDate, category, region]);

  return { sales, loading, error };
}
