import snowflake from "snowflake-sdk";
import dotenv from "dotenv";

dotenv.config();

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,

  authenticator: "SNOWFLAKE",

  role: process.env.SNOWFLAKE_ROLE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

export const connectSnowflake = () => {
  return new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) {
        console.error("Snowflake connection failed:", error.message);
        reject(error);
      } else {
        console.log("Connected to Snowflake successfully!");
        resolve(connection);
      }
    });
  });
};

export const executeQuery = (sqlText, binds = []) => {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: (error, statement, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      },
    });
  });
};