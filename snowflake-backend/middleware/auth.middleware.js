
import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  try {
    // Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach authenticated user to request
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.name, error.message);

  return res.status(401).json({
    success: false,
    message: "Invalid or expired authentication token.",
  });
  }
};

// ADMIN AUTHORIZATION
export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};
