"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, RegisterRequest, AuthContextType } from "../types";
import { authAPI } from "../lib/auth";
import { apartmentAPI } from "../lib/api";
import { toast } from "react-hot-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication data on mount
    const initializeAuth = async () => {
      try {
        const storedToken = authAPI.getStoredToken();
        const storedUser = authAPI.getStoredUser();

        if (storedToken && storedUser) {
          // Set the user state immediately from localStorage
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const authData = await authAPI.login({ email, password });
      setUser(authData.user);
      setToken(authData.token);
      toast.success(`Welcome back, ${authData.user.name}!`);
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      const authData = await authAPI.register(userData);
      setUser(authData.user);
      setToken(authData.token);
      toast.success(`Welcome to ApartmentHub, ${authData.user.name}!`);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      toast.success("Logged out successfully");
    }
  };

  const refreshUser = async () => {
    try {
      if (!token) return;

      const userData = await apartmentAPI.getCurrentUser();
      setUser(userData);

      // Update localStorage
      localStorage.setItem("user_data", JSON.stringify(userData));
    } catch (error: any) {
      console.error("Error refreshing user data:", error);
      // If refresh fails due to invalid token, logout
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
