import { fecthInventory } from "../services/inventory.service";

export const getInventory = async (req, res) => {
  try {
    const inventory = await fecthInventory();
    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (err) {
    console.error("Inventory API error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch inventory data",
    });
  }
};
