const API_URL = import.meta.env.VITE_API_URL;

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  return params.toString();
};

export const getSales = async (filters = {}, signal) => {
  const queryString = buildQueryString(filters);

  const url = `${API_URL}/api/sales${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, { signal });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch sales data");
  }

  return result.data;
};

export const getInventory = async (filters = {}, signal) => {
  const queryString = buildQueryString(filters);

  const url = `${API_URL}/api/inventory${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, { signal });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch inventory");
  }

  return result.data;
};