"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  XCircleIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Modal from "./Modal";
import { apartmentAPI } from "../lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function EditProfileModal({
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    } else if (
      formData.name.trim().length < 2 ||
      formData.name.trim().length > 50
    ) {
      newErrors.name = "Name must be between 2 and 50 characters";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    // Phone validation - basic format check
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password validation - only if user wants to change password
    const isChangingPassword =
      formData.newPassword.trim() || formData.confirmPassword.trim();

    if (isChangingPassword) {
      // Current password is required when changing password
      if (!formData.currentPassword.trim()) {
        newErrors.currentPassword = "Current password is required";
      }

      // New password validation (same rules as registration)
      if (!formData.newPassword.trim()) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters long";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          formData.newPassword
        )
      ) {
        newErrors.newPassword =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      }

      // Confirm password validation
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your new password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const isChangingPassword =
        formData.newPassword.trim() ||
        formData.confirmPassword.trim() ||
        formData.currentPassword.trim();

      if (isChangingPassword) {
        // Update profile with password change
        const updateData = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        };

        await apartmentAPI.updateUserProfileWithPassword(updateData);
        toast.success("Profile and password updated successfully!");
      } else {
        // Update profile without password change
        const updateData = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
        };

        await apartmentAPI.updateUserProfile(updateData);
        toast.success("Profile updated successfully!");
      }

      // Refresh user data
      await refreshUser();

      // Close modal
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Handle validation errors from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const backendErrors: { [key: string]: string } = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field && err.message) {
            backendErrors[err.field] = err.message;
          }
        });
        setErrors(backendErrors);
        toast.error("Please fix the validation errors and try again");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to update profile"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullScreenOnMobile={true}>
      <div className="w-full h-full sm:max-w-2xl sm:h-auto mx-auto bg-white sm:rounded-xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[95vh]">
        {/* Header */}
        <div className="bg-gray-900 px-4 sm:px-6 py-4 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                Edit Profile
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm">
                Update your personal information
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 h-full sm:max-h-[calc(95vh-100px)]"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-4">
            {/* Personal Information Section */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <UserIcon className="h-4 w-4 text-gray-700" />
                </div>
                Personal Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed for security reasons
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.phone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Change Password Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <LockClosedIcon className="h-4 w-4 text-gray-700" />
                </div>
                Change Password
              </h3>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.currentPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Enter your current password"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                        errors.newPassword
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Enter new password"
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• At least one uppercase letter (A-Z)</li>
                    <li>• At least one lowercase letter (a-z)</li>
                    <li>• At least one number (0-9)</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">
                    Leave password fields empty if you don't want to change your
                    password.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-4 sm:relative fixed bottom-0 left-0 right-0 z-10 sm:z-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 hidden sm:block">
                <span className="font-medium">
                  Required fields are marked with *
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="hidden sm:block px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 text-base sm:text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
