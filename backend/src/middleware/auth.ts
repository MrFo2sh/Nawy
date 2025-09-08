/**
 * JWT Authentication Middleware
 */

import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { IJWTPayload, IAuthRequest } from "../types/user.types";
import User from "../models/User";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;

    // Get user from database (without password)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    } else {
      console.error("Authentication error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during authentication",
      });
    }
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we don't send error responses
    // Just continue without setting req.user
    next();
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const payload: IJWTPayload = {
    userId,
    email,
  };

  const options: SignOptions = {
    expiresIn: jwtExpiresIn as any,
  };

  return jwt.sign(payload, jwtSecret, options);
};
