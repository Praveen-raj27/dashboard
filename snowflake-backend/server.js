import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import salesRoutes from "./routes/sales.routes.js";

import { connectSnowflake, executeQuery } from "./config/snowflake.js";

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/sales", salesRoutes);

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
