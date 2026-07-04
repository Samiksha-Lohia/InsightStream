import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper to generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "insightstream_jwt_secret_key_2026_xyz";
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (username, email, password)",
      });
    }

    // Check if user already exists (by email or username)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // Create user record
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during registration",
    });
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password",
      });
    }

    // Find user by email and select password explicitly since it's deselected by default
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.comparePassword(password))) {
      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during login",
    });
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/auth/update-password
 * @access  Private (Authenticated)
 */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both old and new passwords",
      });
    }

    // Find the logged-in user and include password field
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare with old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    // Assign new password (the pre-save hook will hash it automatically)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while updating password",
    });
  }
};
