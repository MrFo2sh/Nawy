import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  Apartment,
  ApartmentCreateRequest,
  ApartmentUpdateRequest,
  ApartmentFilters,
  ApiResponse,
  PaginatedResponse,
  ApartmentStats,
} from "../types";

class ApartmentAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || error.message;

          // If it's an invalid token error, clear stored auth data
          if (
            errorMessage?.includes("Invalid token") ||
            errorMessage?.includes("user not found")
          ) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all apartments with filtering and pagination
   */
  async getApartments(
    filters: ApartmentFilters = {}
  ): Promise<PaginatedResponse<Apartment>> {
    try {
      const response: AxiosResponse<ApiResponse<Apartment[]>> =
        await this.api.get("/apartments", {
          params: filters,
        });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch apartments");
      }

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    } catch (error: any) {
      console.error("Error fetching apartments:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch apartments"
      );
    }
  }

  /**
   * Get apartment by ID
   */
  async getApartmentById(id: string): Promise<Apartment> {
    try {
      const response: AxiosResponse<ApiResponse<Apartment>> =
        await this.api.get(`/apartments/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Apartment not found");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching apartment:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch apartment"
      );
    }
  }

  /**
   * Get current user's apartments
   */
  async getMyApartments(
    filters: ApartmentFilters = {}
  ): Promise<PaginatedResponse<Apartment>> {
    try {
      // Debug: Check if we have a token
      const token = localStorage.getItem("auth_token");

      const response: AxiosResponse<ApiResponse<Apartment[]>> =
        await this.api.get("/apartments/my-apartments", {
          params: filters,
        });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch my apartments"
        );
      }

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    } catch (error: any) {
      console.error("Error fetching my apartments:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch my apartments"
      );
    }
  }

  /**
   * Create new apartment with file upload support
   */
  async createApartmentWithFiles(
    apartmentData: ApartmentCreateRequest,
    files: File[]
  ): Promise<Apartment> {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Append all apartment data
      Object.entries(apartmentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            // Handle arrays (like amenities, leaseTerms)
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item.toString());
            });
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append image files
      files.forEach((file) => {
        formData.append("images", file);
      });

      // Get token for authentication
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("You must be logged in to create an apartment");
      }

      const response = await fetch(`${this.api.defaults.baseURL}/apartments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create apartment");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to create apartment");
      }

      return result.data;
    } catch (error: any) {
      console.error("Error creating apartment with files:", error);
      throw new Error(error.message || "Failed to create apartment");
    }
  }

  /**
   * Create new apartment
   */
  async createApartment(
    apartmentData: ApartmentCreateRequest
  ): Promise<Apartment> {
    try {
      const response: AxiosResponse<ApiResponse<Apartment>> =
        await this.api.post("/apartments", apartmentData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to create apartment");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error creating apartment:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create apartment"
      );
    }
  }

  /**
   * Update apartment by ID
   */
  async updateApartment(
    id: string,
    apartmentData: ApartmentUpdateRequest
  ): Promise<Apartment> {
    try {
      const response: AxiosResponse<ApiResponse<Apartment>> =
        await this.api.put(`/apartments/${id}`, apartmentData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update apartment");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error updating apartment:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update apartment"
      );
    }
  }

  /**
   * Update apartment with file upload support
   */
  async updateApartmentWithFiles(
    id: string,
    apartmentData: ApartmentUpdateRequest,
    files: File[],
    existingImages: string[]
  ): Promise<Apartment> {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Append all apartment data
      Object.entries(apartmentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            // Handle arrays (like amenities, leaseTerms)
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item.toString());
            });
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append existing images as JSON string
      formData.append("existingImages", JSON.stringify(existingImages));

      // Append new image files
      files.forEach((file) => {
        formData.append("images", file);
      });

      // Get token for authentication
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("You must be logged in to update an apartment");
      }

      const response = await fetch(
        `${this.api.defaults.baseURL}/apartments/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update apartment");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to update apartment");
      }

      return result.data;
    } catch (error: any) {
      console.error("Error updating apartment with files:", error);
      throw new Error(error.message || "Failed to update apartment");
    }
  }

  /**
   * Delete apartment by ID
   */
  async deleteApartment(id: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
        `/apartments/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete apartment");
      }
    } catch (error: any) {
      console.error("Error deleting apartment:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete apartment"
      );
    }
  }

  /**
   * Search apartments
   */
  async searchApartments(
    query: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Apartment>> {
    try {
      const response: AxiosResponse<ApiResponse<Apartment[]>> =
        await this.api.get("/apartments/search", {
          params: {
            q: query,
            ...options,
          },
        });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to search apartments");
      }

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    } catch (error: any) {
      console.error("Error searching apartments:", error);
      throw new Error(
        error.response?.data?.message || "Failed to search apartments"
      );
    }
  }

  /**
   * Get apartment statistics
   */
  async getApartmentStats(): Promise<ApartmentStats> {
    try {
      const response: AxiosResponse<ApiResponse<ApartmentStats>> =
        await this.api.get("/apartments/stats");

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to fetch apartment statistics"
        );
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching apartment stats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch apartment statistics"
      );
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await this.api.get("/auth/me");

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to fetch user profile"
        );
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: {
    name: string;
    phone: string;
  }): Promise<any> {
    try {
      const response = await this.api.put("/auth/profile", userData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update profile");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }

  /**
   * Update user profile with password change
   */
  async updateUserProfileWithPassword(userData: {
    name: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    try {
      const response = await this.api.put("/auth/profile", userData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update profile");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error updating user profile with password:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
}

// Create and export a singleton instance
export const apartmentAPI = new ApartmentAPI();
export default apartmentAPI;
