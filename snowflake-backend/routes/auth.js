
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { executeQuery } from "../snowflake.js";

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate password
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Check whether email already exists
    const existingUsers = await executeQuery(
      `SELECT ID FROM USERS WHERE LOWER(EMAIL) = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into Snowflake
    await executeQuery(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE)
       VALUES (?, ?, ?, 'user')`,
      [normalizedName, normalizedEmail, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please sign in.",
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register. Please try again.",
    });
  }
});

//Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe, loginRole } = req.body;

    // Validate request
    if (!email?.trim() || !password || !loginRole) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const selectedRole = loginRole.toLowerCase();

    if (!["user", "admin"].includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid login role.",
      });
    }

    // Find user in Snowflake
    const users = await executeQuery(
      `SELECT ID, NAME, EMAIL, PASSWORD, ROLE
       FROM USERS
       WHERE LOWER(EMAIL) = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    // Verify password using bcrypt
    const passwordMatch = await bcrypt.compare(
      password,
      user.PASSWORD
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify selected role
    const databaseRole = user.ROLE?.toLowerCase();

    if (databaseRole !== selectedRole) {
      return res.status(403).json({
        success: false,
        message: `Please select ${databaseRole} login.`,
      });
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

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
        role: databaseRole,
      },
    });

  } catch (error) {
    console.error("Login API error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

export default router;
