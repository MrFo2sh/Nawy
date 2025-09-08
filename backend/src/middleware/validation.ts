import {
  body,
  param,
  query,
  ValidationChain,
  validationResult,
} from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check validation results and return errors if any
 */
export const checkValidationResult = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : "unknown",
        message: error.msg,
      })),
    });
    return;
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const validateUserRegistration: ValidationChain[] = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address")
    .isLength({ max: 100 })
    .withMessage("Email cannot exceed 100 characters"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("phone")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
];

/**
 * Validation rules for user login
 */
export const validateUserLogin: ValidationChain[] = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for user profile update
 */
export const validateUserProfileUpdate: ValidationChain[] = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("phone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
];

/**
 * Validation rules for profile update with optional password change
 */
export const validateProfileWithPasswordChange: ValidationChain[] = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("phone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("currentPassword")
    .optional()
    .notEmpty()
    .withMessage("Current password is required when changing password"),

  body("newPassword")
    .optional()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword")
    .optional()
    .custom((value, { req }) => {
      if (req.body.newPassword && value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
];

export const validateCreateApartment: ValidationChain[] = [
  body("unitName")
    .notEmpty()
    .withMessage("Unit name is required")
    .isLength({ max: 100 })
    .withMessage("Unit name cannot exceed 100 characters")
    .trim(),

  body("unitNumber")
    .notEmpty()
    .withMessage("Unit number is required")
    .isLength({ max: 20 })
    .withMessage("Unit number cannot exceed 20 characters")
    .trim(),

  body("project")
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 100 })
    .withMessage("Project name cannot exceed 100 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters")
    .trim(),

  body("bedrooms")
    .isInt({ min: 0, max: 10 })
    .withMessage("Bedrooms must be a number between 0 and 10"),

  body("bathrooms")
    .isFloat({ min: 0.5, max: 10 })
    .withMessage("Bathrooms must be a number between 0.5 and 10"),

  body("squareFootage")
    .isInt({ min: 100, max: 10000 })
    .withMessage("Square footage must be between 100 and 10,000"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters")
    .trim(),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters")
    .trim(),

  body("state")
    .notEmpty()
    .withMessage("State is required")
    .isLength({ max: 50 })
    .withMessage("State cannot exceed 50 characters")
    .trim(),

  body("zipCode")
    .notEmpty()
    .withMessage("ZIP code is required")
    .isLength({ max: 10 })
    .withMessage("ZIP code cannot exceed 10 characters")
    .trim(),

  body("amenities")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Amenities must be an array with maximum 20 items"),

  body("amenities.*")
    .optional()
    .isString()
    .withMessage("Each amenity must be a string"),

  body("images")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Images must be an array with maximum 10 items"),

  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),

  body("floorPlan")
    .optional()
    .isURL()
    .withMessage("Floor plan must be a valid URL"),

  body("petPolicy")
    .isIn(["allowed", "not-allowed", "conditional"])
    .withMessage(
      "Pet policy must be one of: allowed, not-allowed, conditional"
    ),

  body("parkingSpaces")
    .isInt({ min: 0, max: 10 })
    .withMessage("Parking spaces must be a number between 0 and 10"),

  body("leaseTerms")
    .isArray({ min: 1 })
    .withMessage("Lease terms must be an array with at least one item"),

  body("leaseTerms.*")
    .isString()
    .withMessage("Each lease term must be a string"),

  body("contactEmail")
    .isEmail()
    .withMessage("Contact email must be a valid email address")
    .normalizeEmail(),

  body("contactPhone")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Contact phone must be a valid phone number"),

  body("virtualTourUrl")
    .optional()
    .isURL()
    .withMessage("Virtual tour URL must be a valid URL"),
];

export const validateUpdateApartment: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid apartment ID"),

  body("unitName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Unit name cannot exceed 100 characters")
    .trim(),

  body("unitNumber")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Unit number cannot exceed 20 characters")
    .trim(),

  body("project")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Project name cannot exceed 100 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters")
    .trim(),

  body("bedrooms")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Bedrooms must be a number between 0 and 10"),

  body("bathrooms")
    .optional()
    .isFloat({ min: 0.5, max: 10 })
    .withMessage("Bathrooms must be a number between 0.5 and 10"),

  body("squareFootage")
    .optional()
    .isInt({ min: 100, max: 10000 })
    .withMessage("Square footage must be between 100 and 10,000"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("address")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters")
    .trim(),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters")
    .trim(),

  body("state")
    .optional()
    .isLength({ max: 50 })
    .withMessage("State cannot exceed 50 characters")
    .trim(),

  body("zipCode")
    .optional()
    .isLength({ max: 10 })
    .withMessage("ZIP code cannot exceed 10 characters")
    .trim(),

  body("amenities")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Amenities must be an array with maximum 20 items"),

  body("images")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Images must be an array with maximum 10 items"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),

  body("petPolicy")
    .optional()
    .isIn(["allowed", "not-allowed", "conditional"])
    .withMessage(
      "Pet policy must be one of: allowed, not-allowed, conditional"
    ),

  body("parkingSpaces")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Parking spaces must be a number between 0 and 10"),

  body("leaseTerms")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Lease terms must be an array with at least one item"),

  body("contactEmail")
    .optional()
    .isEmail()
    .withMessage("Contact email must be a valid email address")
    .normalizeEmail(),

  body("contactPhone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Contact phone must be a valid phone number"),

  body("virtualTourUrl")
    .optional()
    .isURL()
    .withMessage("Virtual tour URL must be a valid URL"),
];

export const validateApartmentId: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid apartment ID"),
];

export const validateApartmentQuery: ValidationChain[] = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional({ values: "falsy" })
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters")
    .trim(),

  query("unitName")
    .optional({ values: "falsy" })
    .isLength({ min: 1, max: 100 })
    .withMessage("Unit name must be between 1 and 100 characters")
    .trim(),

  query("unitNumber")
    .optional({ values: "falsy" })
    .isLength({ min: 1, max: 20 })
    .withMessage("Unit number must be between 1 and 20 characters")
    .trim(),

  query("project")
    .optional({ values: "falsy" })
    .isLength({ min: 1, max: 100 })
    .withMessage("Project name must be between 1 and 100 characters")
    .trim(),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),

  query("bedrooms")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Bedrooms must be between 0 and 10"),

  query("bathrooms")
    .optional()
    .isFloat({ min: 0.5, max: 10 })
    .withMessage("Bathrooms must be between 0.5 and 10"),

  query("city")
    .optional({ values: "falsy" })
    .isLength({ min: 1, max: 100 })
    .withMessage("City must be between 1 and 100 characters")
    .trim(),

  query("state")
    .optional({ values: "falsy" })
    .isLength({ min: 1, max: 50 })
    .withMessage("State must be between 1 and 50 characters")
    .trim(),

  query("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),

  query("petPolicy")
    .optional()
    .isIn(["allowed", "not-allowed", "conditional"])
    .withMessage(
      "Pet policy must be one of: allowed, not-allowed, conditional"
    ),

  query("sortBy")
    .optional()
    .isIn([
      "price",
      "bedrooms",
      "bathrooms",
      "squareFootage",
      "createdAt",
      "unitName",
    ])
    .withMessage(
      "sortBy must be one of: price, bedrooms, bathrooms, squareFootage, createdAt, unitName"
    ),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be either asc or desc"),
];
