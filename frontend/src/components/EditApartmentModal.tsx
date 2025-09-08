"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  PlusIcon,
  PhotoIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Modal from "./Modal";
import { apartmentAPI } from "../lib/api";
import { toast } from "react-hot-toast";
import { Apartment } from "../types";

interface EditApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartment: Apartment;
}

interface ApartmentFormData {
  unitName: string;
  unitNumber: string;
  project: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amenities: string[];
  isAvailable: boolean;
  petPolicy: "allowed" | "not-allowed" | "conditional";
  parkingSpaces: number;
  leaseTerms: string[];
  contactEmail: string;
  contactPhone: string;
  virtualTourUrl: string;
  images: File[];
  existingImages: string[];
}

export default function EditApartmentModal({
  isOpen,
  onClose,
  apartment,
}: EditApartmentModalProps) {
  const [formData, setFormData] = useState<ApartmentFormData>({
    unitName: "",
    unitNumber: "",
    project: "",
    description: "",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 0,
    price: 0,
    address: "",
    city: "",
    state: "",
    zipCode: "",
    amenities: [],
    isAvailable: true,
    petPolicy: "not-allowed",
    parkingSpaces: 0,
    leaseTerms: [],
    contactEmail: "",
    contactPhone: "",
    virtualTourUrl: "",
    images: [],
    existingImages: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [currentLeaseTerm, setCurrentLeaseTerm] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Helper function to convert image paths to full URLs
  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("http")) {
      return imagePath; // Already a full URL
    }
    // Convert relative path to full backend URL
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:3001";
    return `${baseUrl}${imagePath}`;
  };

  // Initialize form with apartment data
  useEffect(() => {
    if (apartment) {
      setFormData({
        unitName: apartment.unitName || "",
        unitNumber: apartment.unitNumber || "",
        project: apartment.project || "",
        description: apartment.description || "",
        bedrooms: apartment.bedrooms || 1,
        bathrooms: apartment.bathrooms || 1,
        squareFootage: apartment.squareFootage || 0,
        price: apartment.price || 0,
        address: apartment.address || "",
        city: apartment.city || "",
        state: apartment.state || "",
        zipCode: apartment.zipCode || "",
        amenities: apartment.amenities || [],
        isAvailable: apartment.isAvailable ?? true,
        petPolicy: apartment.petPolicy || "not-allowed",
        parkingSpaces: apartment.parkingSpaces || 0,
        leaseTerms: apartment.leaseTerms || [],
        contactEmail: apartment.contactEmail || "",
        contactPhone: apartment.contactPhone || "",
        virtualTourUrl: apartment.virtualTourUrl || "",
        images: [],
        existingImages: apartment.images || [],
      });

      // Set existing images as previews using the proper URL conversion
      if (apartment.images && apartment.images.length > 0) {
        setImagePreviews(apartment.images.map((image) => getImageUrl(image)));
      }
    }
  }, [apartment]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate image files
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (
      validFiles.length +
        formData.images.length +
        formData.existingImages.length >
      10
    ) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    // Create preview URLs for new images
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const totalExistingImages = formData.existingImages.length;

    if (index < totalExistingImages) {
      // Remove existing image
      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
      }));
    } else {
      // Remove new image
      const newImageIndex = index - totalExistingImages;
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== newImageIndex),
      }));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (
      currentAmenity.trim() &&
      !formData.amenities.includes(currentAmenity.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, currentAmenity.trim()],
      }));
      setCurrentAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const addLeaseTerm = () => {
    if (
      currentLeaseTerm.trim() &&
      !formData.leaseTerms.includes(currentLeaseTerm.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        leaseTerms: [...prev.leaseTerms, currentLeaseTerm.trim()],
      }));
      setCurrentLeaseTerm("");

      // Clear lease terms error when user adds a term
      if (errors.leaseTerms) {
        setErrors((prev) => ({ ...prev, leaseTerms: "" }));
      }
    }
  };

  const removeLeaseTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      leaseTerms: prev.leaseTerms.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.unitName.trim()) newErrors.unitName = "Unit name is required";
    if (!formData.unitNumber.trim())
      newErrors.unitNumber = "Unit number is required";
    if (!formData.project.trim())
      newErrors.project = "Project name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.bedrooms < 0)
      newErrors.bedrooms = "Bedrooms must be 0 or more";
    if (formData.bathrooms <= 0)
      newErrors.bathrooms = "Bathrooms must be greater than 0";
    if (formData.squareFootage < 100 || formData.squareFootage > 10000)
      newErrors.squareFootage = "Square footage must be between 100 and 10,000";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!formData.contactEmail.trim())
      newErrors.contactEmail = "Contact email is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Contact phone is required";

    // Lease terms validation - at least one term required
    const validLeaseTerms = formData.leaseTerms.filter(
      (term) => term.trim() !== ""
    );
    if (validLeaseTerms.length === 0) {
      newErrors.leaseTerms = "At least one lease term is required";
    }

    // Virtual tour URL validation - if provided, must be valid URL
    if (
      formData.virtualTourUrl.trim() &&
      !formData.virtualTourUrl.match(/^https?:\/\/.*$/)
    ) {
      newErrors.virtualTourUrl =
        "Virtual tour URL must be a valid HTTP/HTTPS URL";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
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
      const { images, existingImages, ...apartmentData } = formData;

      // Clean up optional fields - remove empty strings to avoid validation errors
      const cleanedData = {
        ...apartmentData,
        virtualTourUrl: apartmentData.virtualTourUrl.trim() || undefined,
        // Ensure leaseTerms is not empty array (required field)
        leaseTerms: apartmentData.leaseTerms.filter(
          (term) => term.trim() !== ""
        ),
        // Ensure amenities doesn't have empty strings
        amenities: apartmentData.amenities.filter(
          (amenity) => amenity.trim() !== ""
        ),
      };

      // Remove undefined virtualTourUrl if empty
      const finalData = {
        ...cleanedData,
      };

      if (!finalData.virtualTourUrl) {
        delete finalData.virtualTourUrl;
      }

      // Check if there are new images to upload
      if (images.length > 0) {
        // Use the file upload method
        await apartmentAPI.updateApartmentWithFiles(
          apartment._id,
          finalData,
          images,
          existingImages
        );
      } else {
        // Use the regular update method with existing images
        await apartmentAPI.updateApartment(apartment._id, {
          ...finalData,
          images: existingImages,
        });
      }

      toast.success("Apartment updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error updating apartment:", error);

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
            "Failed to update apartment"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullScreenOnMobile={true}>
      <div className="w-full h-full sm:max-w-5xl sm:h-auto mx-auto bg-white sm:rounded-xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[95vh]">
        {/* Header */}
        <div className="bg-gray-900 px-4 sm:px-6 py-4 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                Edit Apartment
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm">
                Update apartment details and information
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-8 pb-24 sm:pb-4">
            {/* Basic Information Section */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">1</span>
                </div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="unitName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Unit Name *
                    </label>
                    <input
                      type="text"
                      id="unitName"
                      name="unitName"
                      value={formData.unitName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                        errors.unitName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="e.g., Luxury Studio A1"
                    />
                    {errors.unitName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {errors.unitName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="unitNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Unit Number *
                    </label>
                    <input
                      type="text"
                      id="unitNumber"
                      name="unitNumber"
                      value={formData.unitNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                        errors.unitNumber
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="e.g., A101, 2B"
                    />
                    {errors.unitNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {errors.unitNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="project"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                        errors.project
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="e.g., Sunset Towers"
                    />
                    {errors.project && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {errors.project}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Monthly Rent ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleNumberChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                        errors.price
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="2000"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors resize-none ${
                    errors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Describe your apartment in detail - highlight the best features, amenities, and what makes it special..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </section>

            {/* Property Details Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">2</span>
                </div>
                Property Details
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="bedrooms"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bathrooms"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleNumberChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="squareFootage"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Square Footage *
                  </label>
                  <input
                    type="number"
                    id="squareFootage"
                    name="squareFootage"
                    value={formData.squareFootage || ""}
                    onChange={handleNumberChange}
                    min="100"
                    max="10000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.squareFootage
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="e.g. 800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="hidden sm:inline">Square footage </span>
                    (100-10,000 sq ft)
                  </p>
                  {errors.squareFootage && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.squareFootage}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="parkingSpaces"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    id="parkingSpaces"
                    name="parkingSpaces"
                    value={formData.parkingSpaces}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Images Section */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">3</span>
                </div>
                Property Images
              </h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700 hover:text-gray-900">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB each (Max 10 images)
                    </p>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error("Image failed to load:", preview);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Location Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">4</span>
                </div>
                Location
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.address
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Street address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.city
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.state
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.zipCode
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="ZIP Code"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information Section */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">5</span>
                </div>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.contactEmail
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                      errors.contactPhone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Amenities Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">6</span>
                </div>
                Amenities & Features
              </h3>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentAmenity}
                    onChange={(e) => setCurrentAmenity(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAmenity())
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors"
                    placeholder="Add an amenity (e.g., Pool, Gym, WiFi)"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-3 sm:px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-0 sm:gap-2 whitespace-nowrap"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>

                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="text-gray-600 hover:text-gray-800 ml-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Additional Options Section */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold text-sm">7</span>
                </div>
                Additional Options
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <label
                      htmlFor="isAvailable"
                      className="text-sm text-gray-700"
                    >
                      This apartment is currently available for rent
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uncheck if the apartment is currently occupied or not
                    available
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="petPolicy"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pet Policy
                  </label>
                  <select
                    id="petPolicy"
                    name="petPolicy"
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors"
                  >
                    <option value="not-allowed">Pets Not Allowed</option>
                    <option value="allowed">Pets Allowed</option>
                    <option value="conditional">
                      Pets Allowed with Conditions
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label
                    htmlFor="virtualTourUrl"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Virtual Tour URL
                  </label>
                  <input
                    type="url"
                    id="virtualTourUrl"
                    name="virtualTourUrl"
                    value={formData.virtualTourUrl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors ${
                      errors.virtualTourUrl
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="https://virtualtour.example.com"
                  />
                  {errors.virtualTourUrl && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.virtualTourUrl}
                    </p>
                  )}
                </div>
              </div>

              {/* Lease Terms */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Lease Terms *
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentLeaseTerm}
                      onChange={(e) => setCurrentLeaseTerm(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addLeaseTerm())
                      }
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-400 transition-colors ${
                        errors.leaseTerms
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Add a lease term (e.g., 6 months, 12 months)"
                    />
                    <button
                      type="button"
                      onClick={addLeaseTerm}
                      className="px-3 sm:px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-0 sm:gap-2 whitespace-nowrap"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>

                  {errors.leaseTerms && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.leaseTerms}
                    </p>
                  )}

                  {formData.leaseTerms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.leaseTerms.map((term, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200"
                        >
                          {term}
                          <button
                            type="button"
                            onClick={() => removeLeaseTerm(index)}
                            className="text-gray-600 hover:text-gray-800 ml-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {errors.leaseTerms && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {errors.leaseTerms}
                    </p>
                  )}
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
                    "Update Apartment Listing"
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
