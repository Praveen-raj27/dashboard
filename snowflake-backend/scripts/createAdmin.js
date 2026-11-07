import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectSnowflake, executeQuery } from "../config/snowflake";

dotenv.config();

async function createAdmin() {
  let connection;

  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required."
      );
    }

    if (password.length < 8) {
      throw new Error("Admin password must contain at least 8 characters.");
    }

    connection = await connectSnowflake();

    // Check whether the email already exists
    const existingUsers = await executeQuery(
      `SELECT ID FROM USERS WHERE LOWER(EMAIL) = ? LIMIT 1`,
      [email]
    );

    if (existingUsers.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Always assign admin role from the backend script
    await executeQuery(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE)
       VALUES (?, ?, ?, 'admin')`,
      [name, email, hashedPassword]
    );

    console.log("Admin account created successfully!");
    console.log("Admin email:", email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await new Promise((resolve) => {
        connection.destroy(() => resolve());
      });
    }
  }
}

createAdmin();