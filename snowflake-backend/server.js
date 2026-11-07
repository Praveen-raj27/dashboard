import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

import { connectSnowflake, executeQuery } from "./snowflake.js";

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const rows = await executeQuery("SELECT CURRENT_VERSION() AS VERSION");

    res.status(200).json({
      success: true,
      backend: "connected",
      snowflake: "connected",
      version: rows[0]?.VERSION,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      success: false,
      backend: "connected",
      snowflake: "disconnected",
      message: "Snowflake connection unavailable",
      checkedAt: new Date().toISOString(),
    });
  }
});

// Get filtered sales

app.get("/api/sales", async (req, res) => {
  try {
    const { startDate, endDate, category, region } = req.query;

    let query = `
      SELECT
        ID,
        PRODUCT_NAME,
        CATEGORY,
        AMOUNT,
        REGION,
        SALE_DATE
      FROM SALES
    `;

    const conditions = [];
    const binds = [];

    if (startDate) {
      conditions.push("SALE_DATE >= TO_DATE(?)");
      binds.push(startDate);
    }

    if (endDate) {
      conditions.push("SALE_DATE <= TO_DATE(?)");
      binds.push(endDate);
    }

    if (category) {
      conditions.push("CATEGORY = ?");
      binds.push(category);
    }

    if (region) {
      conditions.push("REGION = ?");
      binds.push(region);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY SALE_DATE DESC";

    const sales = await executeQuery(query, binds);

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
});


// Start backend
const startServer = async () => {
  try {
    await connectSnowflake();

    app.listen(PORT, () => {
      console.log("Server running at http://localhost:5001");
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
