
import { fetchSales } from "../services/sales.service.js";

export const getSales = async (req, res) => {
  try {
    const { startDate, endDate, category, region } = req.query;

    const sales = await fetchSales({
      startDate,
      endDate,
      category,
      region,
    });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error("Sales API error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch sales data",
    });
  }
};
