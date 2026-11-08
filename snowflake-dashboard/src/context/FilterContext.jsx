import { createContext, useContext, useState } from "react";

const FilterContext = createContext(null);

const initialFilters = {
  category: "",
  supplier: "",
  paymentStatus: "",
  stockStatus: "",
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({ ...initialFilters });
  };

  return (
    <FilterContext.Provider
      value={{ filters, updateFilters, resetFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilters must be used inside FilterProvider");
  }

  return context;
}