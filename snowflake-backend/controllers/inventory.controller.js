
import { fetchInventory } from "../services/inventory.service.js";

export const getInventory = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const inventory = await fetchInventory({
      startDate,
      endDate,
      category,
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (err) {
    console.error("Inventory API error:", err.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch inventory data",
    });
  }
};
