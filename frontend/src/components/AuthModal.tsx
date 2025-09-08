"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import AuthModalWrapper from "./AuthModalWrapper";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loginData, setLoginData] = useState({
    email: "test@test.com",
    password: "Password123!",
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Real-time validation for name field
    if (name === "name") {
      const trimmedValue = value.trim();
      if (trimmedValue && !/^[a-zA-Z\s]+$/.test(trimmedValue)) {
        setErrors((prev) => ({
          ...prev,
          name: "Name can only contain letters and spaces",
        }));
      } else if (
        trimmedValue &&
        (trimmedValue.length < 2 || trimmedValue.length > 50)
      ) {
        setErrors((prev) => ({
          ...prev,
          name: "Name must be between 2 and 50 characters",
        }));
      }
    }

    // Auto-format phone number
    if (name === "phone") {
      let formattedPhone = value.trim();

      // If user enters phone without +, try to add appropriate country code
      if (formattedPhone && !formattedPhone.startsWith("+")) {
        // If starts with 0 (common in many countries), remove it and add country code
        if (formattedPhone.startsWith("0")) {
          // For Egyptian numbers starting with 01 or 02
          if (
            formattedPhone.startsWith("01") ||
            formattedPhone.startsWith("02")
          ) {
            formattedPhone = "+20" + formattedPhone.substring(1);
          } else {
            // Generic: remove leading 0 and user will need to add country code
            formattedPhone = "+" + formattedPhone.substring(1);
          }
        } else if (/^\d/.test(formattedPhone)) {
          // If starts with digit, add + prefix
          formattedPhone = "+" + formattedPhone;
        }
      }

      setRegisterData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
      return;
    }

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhone = (phone: string): boolean => {
    // Check if phone matches international format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string): boolean => {
    const trimmedName = name.trim();
    // Check if name only contains letters and spaces, and is between 2-50 characters
    return (
      trimmedName.length >= 2 &&
      trimmedName.length <= 50 &&
      /^[a-zA-Z\s]+$/.test(trimmedName)
    );
  };

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(loginData.email, loginData.password);
      resetAndClose();
    } catch (error) {
      // Error is already handled in useAuth hook
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validateName(registerData.name)) {
      toast.error(
        "Name must be between 2-50 characters and can only contain letters and spaces"
      );
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePassword(registerData.password)) {
      toast.error(
        "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (!validatePhone(registerData.phone)) {
      toast.error(
        "Please enter a valid phone number with country code (e.g., +201060517268)"
      );
      return;
    }

    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });
      resetAndClose();
    } catch (error) {
      // Error is already handled in useAuth hook
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const resetAndClose = () => {
    setLoginData({
      email: "test@test.com",
      password: "Password123!",
      rememberMe: false,
    });
    setRegisterData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setMode(initialMode);
    onClose();
  };

  return (
    <AuthModalWrapper isOpen={isOpen} onClose={resetAndClose}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          {mode === "login" ? (
            <UserIcon className="h-12 w-12 text-black" />
          ) : (
            <UserPlusIcon className="h-12 w-12 text-black" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === "login"
            ? "Sign in to manage your apartment listings"
            : "Join us to start listing your apartments"}
        </p>
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={loginData.email}
              onChange={handleLoginChange}
              className="input-field"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
                className="input-field pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={loginData.rememberMe}
                onChange={handleLoginChange}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-black hover:text-gray-700"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center font-medium"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-medium text-black hover:text-gray-700"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={registerData.name}
              onChange={handleRegisterChange}
              className={`input-field ${
                errors.name ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={registerData.email}
              onChange={handleRegisterChange}
              className="input-field"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={registerData.phone}
              onChange={handleRegisterChange}
              className="input-field"
              placeholder="e.g., +1234567890 or +201060517268"
            />
            <p className="mt-1 text-xs text-gray-500">
              Include country code (e.g., +20 for Egypt, +1 for US)
            </p>
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={registerData.password}
                onChange={handleRegisterChange}
                className="input-field pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must contain uppercase, lowercase, number, and special
              character
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="input-field pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center font-medium"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-medium text-black hover:text-gray-700"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      )}
    </AuthModalWrapper>
  );
}
