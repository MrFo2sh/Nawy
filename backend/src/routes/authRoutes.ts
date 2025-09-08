/**
 * Authentication Routes
 */

import { Router } from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import {
  validateUserRegistration,
  validateUserLogin,
  validateProfileWithPasswordChange,
  checkValidationResult,
} from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and profile management endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   error: "Email is required"
 *               userExists:
 *                 value:
 *                   success: false
 *                   message: "User already exists"
 *                   error: "A user with this email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post(
  "/register",
  validateUserRegistration,
  checkValidationResult,
  register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user and return a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Invalid credentials"
 *               error: "Email or password is incorrect"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/login", validateUserLogin, checkValidationResult, login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the profile information of the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               noToken:
 *                 value:
 *                   success: false
 *                   message: "Access denied"
 *                   error: "No token provided"
 *               invalidToken:
 *                 value:
 *                   success: false
 *                   message: "Invalid token"
 *                   error: "Token is invalid or expired"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/me", authenticateToken, getMe);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user (client-side token removal - stateless JWT)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/logout", authenticateToken, logout);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information with optional password change
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated user name
 *                 example: "John Updated Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: "john.updated@example.com"
 *               phone:
 *                 type: string
 *                 description: Updated phone number
 *                 example: "+1234567890"
 *               currentPassword:
 *                 type: string
 *                 description: Current password (required if changing password)
 *                 example: "CurrentPass123"
 *               newPassword:
 *                 type: string
 *                 description: New password (optional, requires currentPassword)
 *                 example: "NewSecurePass123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password (required if newPassword provided)
 *                 example: "NewSecurePass123"
 *             required:
 *               - name
 *               - email
 *               - phone
 *           examples:
 *             profileUpdate:
 *               summary: Update profile without password change
 *               value:
 *                 name: "John Updated Doe"
 *                 email: "john.updated@example.com"
 *                 phone: "+1234567890"
 *             profileWithPasswordChange:
 *               summary: Update profile with password change
 *               value:
 *                 name: "John Updated Doe"
 *                 email: "john.updated@example.com"
 *                 phone: "+1234567890"
 *                 currentPassword: "CurrentPass123"
 *                 newPassword: "NewSecurePass123"
 *                 confirmPassword: "NewSecurePass123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Bad request - validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   error: "Password confirmation does not match"
 *               emailExists:
 *                 value:
 *                   success: false
 *                   message: "Email already in use"
 *                   error: "Another user is already using this email"
 *               wrongPassword:
 *                 value:
 *                   success: false
 *                   message: "Current password is incorrect"
 *                   error: "Please provide the correct current password"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put(
  "/profile",
  authenticateToken,
  validateProfileWithPasswordChange,
  checkValidationResult,
  updateProfile
);

export default router;
