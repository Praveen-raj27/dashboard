
const API_URL = import.meta.env.VITE_API_URL;

export const getSales = async (filters = {}, signal) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();

  const url = `${API_URL}/api/sales${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch sales data");
  }

  const result = await response.json();

  return result.data;
};


export const getInventory = async (filters = {}, signal) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();

  const url = `${API_URL}/api/inventory${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, { signal });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch inventory"
    );
  }

  return result.data;
};
