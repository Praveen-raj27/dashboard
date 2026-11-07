
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/snowflake.js";

// REGISTER USER
export const registerUser = async ({
  name,
  email,
  password,
}) => {
  // Check existing email
  const existingUsers = await executeQuery(
    `SELECT ID FROM USERS
     WHERE LOWER(EMAIL) = ?
     LIMIT 1`,
    [email]
  );

  if (existingUsers.length > 0) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert user
  await executeQuery(
    `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE)
     VALUES (?, ?, ?, 'user')`,
    [name, email, hashedPassword]
  );
};

// LOGIN USER
export const loginUser = async ({
  email,
  password,
  loginRole,
  rememberMe,
}) => {
  // Find user
  const users = await executeQuery(
    `SELECT ID, NAME, EMAIL, PASSWORD, ROLE
     FROM USERS
     WHERE LOWER(EMAIL) = ?
     LIMIT 1`,
    [email]
  );

  if (!users || users.length === 0) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];

  // Verify password
  const passwordMatch = await bcrypt.compare(
    password,
    user.PASSWORD
  );

  if (!passwordMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Verify role
  const databaseRole = user.ROLE?.toLowerCase();

  if (databaseRole !== loginRole) {
    const error = new Error(
      `Please select ${databaseRole} login.`
    );
    error.statusCode = 403;
    throw error;
  }

  // Generate JWT
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing.");
  }

  const expiresIn = rememberMe ? "7d" : "1d";

  const token = jwt.sign(
    {
      role: databaseRole,
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.ID),
      expiresIn,
    }
  );

  return {
    token,
    user: {
      id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      role: databaseRole,
    },
  };
};
