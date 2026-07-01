import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes with JWT token authentication
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecretjwtkey_insightstream_12345"
      );

      // Get user from the token (exclude password) and attach to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
      }

      return next();
    } catch (error) {
      console.error("Token Verification Error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed verification",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};
