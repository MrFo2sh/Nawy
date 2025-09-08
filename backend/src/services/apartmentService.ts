import { Apartment } from "../models";
import {
  IApartment,
  ApartmentCreateDTO,
  ApartmentUpdateDTO,
  ApartmentQueryParams,
  PaginatedResponse,
} from "../types";

export class ApartmentService {
  /**
   * Get all apartments with filtering, searching, and pagination
   */
  async getAllApartments(
    params: ApartmentQueryParams
  ): Promise<PaginatedResponse<IApartment>> {
    const {
      page = 1,
      limit = 10,
      search,
      unitName,
      unitNumber,
      project,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      state,
      isAvailable,
      petPolicy,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build query object
    const query: any = {};

    // Search functionality
    if (search) {
      query.$or = [
        { unitName: { $regex: search, $options: "i" } },
        { unitNumber: { $regex: search, $options: "i" } },
        { project: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    // Individual filters
    if (unitName) query.unitName = { $regex: unitName, $options: "i" };
    if (unitNumber) query.unitNumber = { $regex: unitNumber, $options: "i" };
    if (project) query.project = { $regex: project, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };
    if (state) query.state = { $regex: state, $options: "i" };
    if (typeof isAvailable === "boolean") query.isAvailable = isAvailable;
    if (petPolicy) query.petPolicy = petPolicy;
    if (bedrooms) query.bedrooms = { $gte: bedrooms };
    if (bathrooms) query.bathrooms = { $gte: bathrooms };

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const [apartments, total] = await Promise.all([
      Apartment.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Apartment.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: apartments as IApartment[],
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Get apartment by ID
   */
  async getApartmentById(id: string): Promise<IApartment | null> {
    try {
      const apartment = await Apartment.findById(id).lean();
      return apartment as IApartment | null;
    } catch (error) {
      throw new Error(`Error fetching apartment: ${error}`);
    }
  }

  /**
   * Get apartments by user ID with pagination
   */
  async getApartmentsByUserId(
    userId: string,
    params: ApartmentQueryParams = {}
  ): Promise<PaginatedResponse<IApartment>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    try {
      // Build query object with userId filter
      const query: any = { userId };

      // Add search functionality if provided
      if (search) {
        query.$and = [
          { userId },
          {
            $or: [
              { unitName: { $regex: search, $options: "i" } },
              { project: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { address: { $regex: search, $options: "i" } },
              { city: { $regex: search, $options: "i" } },
            ],
          },
        ];
        delete query.userId; // Remove userId from query since it's in $and
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute query with pagination
      const [apartments, total] = await Promise.all([
        Apartment.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
        Apartment.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: apartments as IApartment[],
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching user apartments: ${error}`);
    }
  }

  /**
   * Create new apartment
   */
  async createApartment(
    apartmentData: ApartmentCreateDTO
  ): Promise<IApartment> {
    try {
      const apartment = new Apartment(apartmentData);
      const savedApartment = await apartment.save();
      return savedApartment.toObject();
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new Error(
          "An apartment with this unit number already exists in this project"
        );
      }
      throw new Error(`Error creating apartment: ${error}`);
    }
  }

  /**
   * Update apartment by ID
   */
  async updateApartment(
    id: string,
    updateData: ApartmentUpdateDTO
  ): Promise<IApartment | null> {
    try {
      const apartment = await Apartment.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();

      return apartment as IApartment | null;
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new Error(
          "An apartment with this unit number already exists in this project"
        );
      }
      throw new Error(`Error updating apartment: ${error}`);
    }
  }

  /**
   * Delete apartment by ID
   */
  async deleteApartment(id: string): Promise<boolean> {
    try {
      const result = await Apartment.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Error deleting apartment: ${error}`);
    }
  }

  /**
   * Get apartment statistics
   */
  async getApartmentStats(): Promise<{
    total: number;
    available: number;
    unavailable: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    bedroomDistribution: { [key: number]: number };
    projectCounts: { [key: string]: number };
  }> {
    try {
      const [
        total,
        available,
        unavailable,
        priceStats,
        bedroomStats,
        projectStats,
      ] = await Promise.all([
        Apartment.countDocuments(),
        Apartment.countDocuments({ isAvailable: true }),
        Apartment.countDocuments({ isAvailable: false }),
        Apartment.aggregate([
          {
            $group: {
              _id: null,
              avgPrice: { $avg: "$price" },
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]),
        Apartment.aggregate([
          {
            $group: {
              _id: "$bedrooms",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Apartment.aggregate([
          {
            $group: {
              _id: "$project",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

      const bedroomDistribution: { [key: number]: number } = {};
      bedroomStats.forEach((stat: any) => {
        bedroomDistribution[stat._id] = stat.count;
      });

      const projectCounts: { [key: string]: number } = {};
      projectStats.forEach((stat: any) => {
        projectCounts[stat._id] = stat.count;
      });

      return {
        total,
        available,
        unavailable,
        averagePrice: priceStats[0]?.avgPrice || 0,
        priceRange: {
          min: priceStats[0]?.minPrice || 0,
          max: priceStats[0]?.maxPrice || 0,
        },
        bedroomDistribution,
        projectCounts,
      };
    } catch (error) {
      throw new Error(`Error fetching apartment statistics: ${error}`);
    }
  }

  /**
   * Search apartments by text
   */
  async searchApartments(
    searchQuery: string,
    options: {
      limit?: number;
      page?: number;
    } = {}
  ): Promise<PaginatedResponse<IApartment>> {
    const { limit = 10, page = 1 } = options;

    try {
      const skip = (page - 1) * limit;

      const [apartments, total] = await Promise.all([
        Apartment.find(
          {
            $text: { $search: searchQuery },
          },
          {
            score: { $meta: "textScore" },
          }
        )
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(limit)
          .lean(),
        Apartment.countDocuments({
          $text: { $search: searchQuery },
        }),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: apartments as IApartment[],
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      };
    } catch (error) {
      throw new Error(`Error searching apartments: ${error}`);
    }
  }
}
