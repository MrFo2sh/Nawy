/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import { generateToken } from "../middleware/auth";
import {
  IUserRegistration,
  IUserLogin,
  IUserResponse,
  IAuthResponse,
} from "../types/user.types";

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password, phone }: IUserRegistration = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone.trim(),
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    // Prepare user response (without password)
    const userResponse: IUserResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const authResponse: IAuthResponse = {
      token,
      user: userResponse,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: authResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error
    if (error instanceof Error && error.message.includes("E11000")) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password }: IUserLogin = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    // Prepare user response (without password)
    const userResponse: IUserResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const authResponse: IAuthResponse = {
      token,
      user: userResponse,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: authResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached to req by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const userResponse: IUserResponse = {
      _id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching profile",
    });
  }
};

/**
 * Logout user (client-side token removal)
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // This endpoint is mainly for consistency and potential future features
    res.status(200).json({
      success: true,
      message:
        "Logout successful. Please remove the token from client storage.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

/**
 * Update user profile with optional password change
 * PUT /api/v1/auth/profile
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    // User is already attached to req by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { name, phone, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update basic profile fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    // Update password if provided
    if (newPassword) {
      // Verify current password
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: "Current password is required to change password",
        });
        return;
      }

      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      user.password = newPassword; // This will be hashed by the pre-save middleware
    }

    await user.save();

    // Prepare user response (without password)
    const userResponse: IUserResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: newPassword
        ? "Profile and password updated successfully"
        : "Profile updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
};
