import {
  connectSnowflake,
  executeQuery,
} from "./config/snowflake.js";

const testConnection = async () => {
  try {
    await connectSnowflake();

    const result = await executeQuery(`
      SELECT
        CURRENT_USER() AS USERNAME,
        CURRENT_ROLE() AS ROLE,
        CURRENT_WAREHOUSE() AS WAREHOUSE,
        CURRENT_DATABASE() AS DATABASE,
        CURRENT_SCHEMA() AS SCHEMA
    `);

    console.log("Snowflake connection details:");
    console.table(result);

    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
};

testConnection();