import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? (error as any).path : error.type,
        message: error.msg,
        value: error.type === "field" ? (error as any).value : undefined,
      })),
    });
    return;
  }

  next();
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }

  // Mongoose duplicate key error
  if (error.name === "MongoServerError" && (error as any).code === 11000) {
    statusCode = 400;
    message = "Duplicate entry. This apartment already exists.";
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      error: error,
    }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
