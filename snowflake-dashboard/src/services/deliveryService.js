
const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = 'http://localhost:5001'

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view your order tracking.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getOrderTrackingHistory = async (
  orderId,
  signal
) => {
  const response = await fetch(
    `${API_URL}/api/delivery/orders/${encodeURIComponent(orderId)}/history`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      signal,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch order tracking history."
    );
  }

  return result.data;
};


export const getCustomerOrders = async (signal) => {
  const response = await fetch(
    `${API_URL}/api/delivery/orders`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      signal,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch your orders."
    );
  }

  return result.data;
};
