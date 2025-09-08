import { Request, Response, NextFunction } from "express";
import { ApartmentService } from "../services";
import { ApartmentQueryParams, ApiResponse } from "../types";
import { asyncHandler } from "../middleware";
import path from "path";

// Extend Request interface to include user and files
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export class ApartmentController {
  private apartmentService: ApartmentService;

  constructor() {
    this.apartmentService = new ApartmentService();
  }

  /**
   * Get all apartments with filtering and pagination
   * GET /api/v1/apartments
   */
  getAllApartments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const queryParams: ApartmentQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        unitName: req.query.unitName as string,
        unitNumber: req.query.unitNumber as string,
        project: req.query.project as string,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        bedrooms: req.query.bedrooms
          ? parseInt(req.query.bedrooms as string)
          : undefined,
        bathrooms: req.query.bathrooms
          ? parseFloat(req.query.bathrooms as string)
          : undefined,
        city: req.query.city as string,
        state: req.query.state as string,
        isAvailable:
          req.query.isAvailable === "true"
            ? true
            : req.query.isAvailable === "false"
            ? false
            : undefined,
        petPolicy: req.query.petPolicy as
          | "allowed"
          | "not-allowed"
          | "conditional",
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.apartmentService.getAllApartments(queryParams);

      const response: ApiResponse<typeof result.data> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get apartment by ID
   * GET /api/v1/apartments/:id
   */
  getApartmentById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const apartment = await this.apartmentService.getApartmentById(id);

      if (!apartment) {
        res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
        return;
      }

      const response: ApiResponse<typeof apartment> = {
        success: true,
        data: apartment,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Create new apartment (requires authentication)
   * POST /api/v1/apartments
   */
  createApartment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required to create apartment",
        });
        return;
      }

      // Handle uploaded images
      const uploadedImages: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        // Convert file paths to full URLs
        uploadedImages.push(
          ...req.files.map(
            (file: Express.Multer.File) =>
              `${req.protocol}://${req.get("host")}/uploads/apartments/${
                file.filename
              }`
          )
        );
      }

      // Add user ID and image URLs to apartment data
      const apartmentData = {
        ...req.body,
        userId: req.user._id,
        images: uploadedImages,
      };

      const apartment = await this.apartmentService.createApartment(
        apartmentData
      );

      const response: ApiResponse<typeof apartment> = {
        success: true,
        data: apartment,
        message: "Apartment created successfully",
      };

      res.status(201).json(response);
    }
  );

  /**
   * Update apartment by ID (requires ownership)
   * PUT /api/v1/apartments/:id
   */
  updateApartment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required to update apartment",
        });
        return;
      }

      // Check if apartment exists and user owns it
      const existingApartment = await this.apartmentService.getApartmentById(
        id
      );
      if (!existingApartment) {
        res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
        return;
      }

      // Check ownership
      if (existingApartment.userId.toString() !== req.user._id.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only update your own apartments",
        });
        return;
      }

      // Handle uploaded images
      const newImages: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        // Convert file paths to full URLs
        newImages.push(
          ...req.files.map(
            (file: Express.Multer.File) =>
              `${req.protocol}://${req.get("host")}/uploads/apartments/${
                file.filename
              }`
          )
        );
      }

      // Merge existing images with new images
      const existingImages = req.body.existingImages
        ? JSON.parse(req.body.existingImages)
        : existingApartment.images;
      const allImages = [...existingImages, ...newImages];

      // Update apartment data with combined images
      const updateData = {
        ...req.body,
        images: allImages,
      };

      const apartment = await this.apartmentService.updateApartment(
        id,
        updateData
      );

      if (!apartment) {
        res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
        return;
      }

      const response: ApiResponse<typeof apartment> = {
        success: true,
        data: apartment,
        message: "Apartment updated successfully",
      };

      res.status(200).json(response);
    }
  );

  /**
   * Delete apartment by ID (requires ownership)
   * DELETE /api/v1/apartments/:id
   */
  deleteApartment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required to delete apartment",
        });
        return;
      }

      // Check if apartment exists and user owns it
      const existingApartment = await this.apartmentService.getApartmentById(
        id
      );
      if (!existingApartment) {
        res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
        return;
      }

      // Check ownership
      if (existingApartment.userId.toString() !== req.user._id.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only delete your own apartments",
        });
        return;
      }

      const deleted = await this.apartmentService.deleteApartment(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Apartment deleted successfully",
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get apartment statistics
   * GET /api/v1/apartments/stats
   */
  getApartmentStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const stats = await this.apartmentService.getApartmentStats();

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Search apartments
   * GET /api/v1/apartments/search
   */
  searchApartments = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const searchQuery = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!searchQuery) {
        res.status(400).json({
          success: false,
          message: "Search query is required",
        });
        return;
      }

      const result = await this.apartmentService.searchApartments(searchQuery, {
        page,
        limit,
      });

      const response: ApiResponse<typeof result.data> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get apartments owned by current user
   * GET /api/v1/apartments/my-listings
   */
  getMyApartments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required to view your apartments",
        });
        return;
      }

      const queryParams: ApartmentQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await this.apartmentService.getApartmentsByUserId(
        req.user._id,
        queryParams
      );

      const response: ApiResponse<typeof result.data> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    }
  );
}
