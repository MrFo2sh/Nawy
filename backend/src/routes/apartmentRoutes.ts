import { Router } from "express";
import { ApartmentController } from "../controllers";
import {
  validateCreateApartment,
  validateUpdateApartment,
  validateApartmentId,
  validateApartmentQuery,
  handleValidationErrors,
  uploadImages,
  handleUploadError,
} from "../middleware";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const apartmentController = new ApartmentController();

/**
 * @swagger
 * tags:
 *   name: Apartments
 *   description: Apartment listing management endpoints
 */

/**
 * @swagger
 * /api/v1/apartments/stats:
 *   get:
 *     summary: Get apartment statistics
 *     description: Retrieve statistical data about apartments including total count, average price, and city distribution
 *     tags: [Apartments]
 *     responses:
 *       200:
 *         description: Apartment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ApartmentStats'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Routes that don't require ID parameter should come first
router.get("/stats", apartmentController.getApartmentStats);

/**
 * @swagger
 * /api/v1/apartments/search:
 *   get:
 *     summary: Search apartments by text
 *     description: Perform full-text search across apartment names, projects, and descriptions
 *     tags: [Apartments]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: "luxury downtown"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Apartment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - missing search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  "/search",
  validateApartmentQuery,
  handleValidationErrors,
  apartmentController.searchApartments
);

/**
 * @swagger
 * /api/v1/apartments/my-apartments:
 *   get:
 *     summary: Get current user's apartments
 *     description: Retrieve apartments created by the authenticated user
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, unitName]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: User's apartments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Apartment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Get user's own apartments (must be authenticated)
router.get(
  "/my-apartments",
  authenticateToken,
  validateApartmentQuery,
  handleValidationErrors,
  apartmentController.getMyApartments
);

/**
 * @swagger
 * /api/v1/apartments:
 *   get:
 *     summary: Get all apartments with filtering and pagination
 *     description: Retrieve all apartments with optional filtering, sorting, and pagination
 *     tags: [Apartments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, project, description
 *         example: "luxury apartment"
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *         example: "San Francisco"
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *         example: "CA"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *         example: 1000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *         example: 5000
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         description: Minimum number of bedrooms
 *         example: 2
 *       - in: query
 *         name: bathrooms
 *         schema:
 *           type: number
 *         description: Minimum number of bathrooms
 *         example: 1.5
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: petPolicy
 *         schema:
 *           type: string
 *           enum: [allowed, not-allowed, conditional]
 *         description: Filter by pet policy
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, bedrooms, bathrooms, squareFootage, createdAt, unitName]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Apartments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Apartment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  "/",
  validateApartmentQuery,
  handleValidationErrors,
  apartmentController.getAllApartments
);

/**
 * @swagger
 * /api/v1/apartments:
 *   post:
 *     summary: Create a new apartment
 *     description: Create a new apartment listing (requires authentication)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - unitName
 *               - unitNumber
 *               - project
 *               - description
 *               - bedrooms
 *               - bathrooms
 *               - squareFootage
 *               - price
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - petPolicy
 *               - parkingSpaces
 *               - leaseTerms
 *               - contactEmail
 *               - contactPhone
 *             properties:
 *               unitName:
 *                 type: string
 *                 example: "Luxury Studio A1"
 *               unitNumber:
 *                 type: string
 *                 example: "A101"
 *               project:
 *                 type: string
 *                 example: "Sunset Towers"
 *               description:
 *                 type: string
 *                 example: "Beautiful modern studio with city views"
 *               bedrooms:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               bathrooms:
 *                 type: number
 *                 minimum: 0
 *                 example: 1.5
 *               squareFootage:
 *                 type: integer
 *                 minimum: 1
 *                 example: 800
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 2500
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 example: "San Francisco"
 *               state:
 *                 type: string
 *                 example: "CA"
 *               zipCode:
 *                 type: string
 *                 example: "94102"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Pool", "Gym", "Parking"]
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *               petPolicy:
 *                 type: string
 *                 enum: [allowed, not-allowed, conditional]
 *                 example: "allowed"
 *               parkingSpaces:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               leaseTerms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["12 months", "24 months"]
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "contact@example.com"
 *               contactPhone:
 *                 type: string
 *                 example: "+1234567890"
 *               virtualTourUrl:
 *                 type: string
 *                 example: "https://virtualtour.example.com"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Apartment images (multiple files allowed)
 *     responses:
 *       201:
 *         description: Apartment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Apartment'
 *                 message:
 *                   type: string
 *                   example: "Apartment created successfully"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Create apartment (requires authentication)
router.post(
  "/",
  authenticateToken,
  uploadImages,
  handleUploadError,
  validateCreateApartment,
  handleValidationErrors,
  apartmentController.createApartment
);

/**
 * @swagger
 * /api/v1/apartments/{id}:
 *   get:
 *     summary: Get apartment by ID
 *     description: Retrieve a specific apartment by its ID
 *     tags: [Apartments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Apartment ID
 *         example: "64a1b2c3d4e5f6789012345b"
 *     responses:
 *       200:
 *         description: Apartment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Apartment'
 *       404:
 *         description: Apartment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Bad request - invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Routes with ID parameter should come after the above routes
router.get(
  "/:id",
  validateApartmentId,
  handleValidationErrors,
  apartmentController.getApartmentById
);

/**
 * @swagger
 * /api/v1/apartments/{id}:
 *   put:
 *     summary: Update apartment by ID
 *     description: Update an existing apartment (only by owner)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Apartment ID
 *         example: "64a1b2c3d4e5f6789012345b"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               unitName:
 *                 type: string
 *                 example: "Updated Luxury Studio A1"
 *               unitNumber:
 *                 type: string
 *                 example: "A101"
 *               project:
 *                 type: string
 *                 example: "Sunset Towers"
 *               description:
 *                 type: string
 *                 example: "Updated beautiful modern studio with city views"
 *               bedrooms:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               bathrooms:
 *                 type: number
 *                 minimum: 0
 *                 example: 1.5
 *               squareFootage:
 *                 type: integer
 *                 minimum: 1
 *                 example: 800
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 2600
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 example: "San Francisco"
 *               state:
 *                 type: string
 *                 example: "CA"
 *               zipCode:
 *                 type: string
 *                 example: "94102"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Pool", "Gym", "Parking", "Rooftop Deck"]
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *               petPolicy:
 *                 type: string
 *                 enum: [allowed, not-allowed, conditional]
 *                 example: "allowed"
 *               parkingSpaces:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               leaseTerms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["12 months", "24 months"]
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "contact@example.com"
 *               contactPhone:
 *                 type: string
 *                 example: "+1234567890"
 *               virtualTourUrl:
 *                 type: string
 *                 example: "https://virtualtour.example.com"
 *               existingImages:
 *                 type: string
 *                 description: JSON string of existing image URLs to keep
 *                 example: '["http://localhost:3001/uploads/image1.jpg"]'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New apartment images to add
 *     responses:
 *       200:
 *         description: Apartment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Apartment'
 *                 message:
 *                   type: string
 *                   example: "Apartment updated successfully"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - can only update own apartments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Apartment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Update apartment (requires authentication)
router.put(
  "/:id",
  authenticateToken,
  uploadImages,
  handleUploadError,
  validateUpdateApartment,
  handleValidationErrors,
  apartmentController.updateApartment
);

/**
 * @swagger
 * /api/v1/apartments/{id}:
 *   delete:
 *     summary: Delete apartment by ID
 *     description: Delete an apartment (only by owner)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Apartment ID
 *         example: "64a1b2c3d4e5f6789012345b"
 *     responses:
 *       200:
 *         description: Apartment deleted successfully
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
 *                   example: "Apartment deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - can only delete own apartments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Apartment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Delete apartment (requires authentication)
router.delete(
  "/:id",
  authenticateToken,
  validateApartmentId,
  handleValidationErrors,
  apartmentController.deleteApartment
);

export default router;
