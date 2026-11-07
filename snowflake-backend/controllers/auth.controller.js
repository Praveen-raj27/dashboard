
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
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
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    await registerUser({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please sign in.",
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 409
          ? error.message
          : "Unable to register. Please try again.",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const {
      email,
      password,
      rememberMe,
      loginRole,
    } = req.body;

    // Validate request
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password ||
      typeof loginRole !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const selectedRole = loginRole.trim().toLowerCase();

    // Validate role
    if (!["user", "admin"].includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid login role.",
      });
    }

    const result = await loginUser({
      email: normalizedEmail,
      password,
      loginRole: selectedRole,
      rememberMe: rememberMe === true,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: result.token,
      user: result.user,
    });

  } catch (error) {
    console.error("Login API error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 401 || error.statusCode === 403
          ? error.message
          : "Internal server error.",
    });
  }
};
