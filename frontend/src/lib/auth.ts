import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "../types";

class AuthAPI {
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

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
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
        // Only refresh on 401 for authenticated requests (not login/register)
        if (
          error.response?.status === 401 &&
          !error.config?.url?.includes("/auth/login") &&
          !error.config?.url?.includes("/auth/register")
        ) {
          // Token expired or invalid - only for authenticated endpoints
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          window.location.reload();
        }
        console.error(
          "❌ Auth API Response Error:",
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> =
        await this.api.post("/auth/login", credentials);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Login failed");
      }

      const authData = response.data.data;

      // Store token and user data
      localStorage.setItem("auth_token", authData.token);
      localStorage.setItem("user_data", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(errorMessage);
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> =
        await this.api.post("/auth/register", userData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Registration failed");
      }

      const authData = response.data.data;

      // Store token and user data
      localStorage.setItem("auth_token", authData.token);
      localStorage.setItem("user_data", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
        "/auth/profile"
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch profile");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Get profile error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      await this.api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("auth_token");
    return !!token;
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  }

  /**
   * Get stored auth token
   */
  getStoredToken(): string | null {
    return localStorage.getItem("auth_token");
  }
}

// Create and export a singleton instance
export const authAPI = new AuthAPI();
export default authAPI;
