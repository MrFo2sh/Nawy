"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import CustomImage from "../../../components/CustomImage";
import {
  ArrowLeftIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { apartmentAPI } from "../../../lib/api";
import { Apartment } from "../../../types";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Header from "../../../components/Header";
import EditApartmentModal from "../../../components/EditApartmentModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import { useAuth } from "../../../hooks/useAuth";

export default function ApartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const apartmentId = params.id as string;

  // Check if the current user is the owner of this apartment
  const isOwner = user && apartment && user._id === apartment.userId;

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

  useEffect(() => {
    if (apartmentId) {
      fetchApartment();
    }
  }, [apartmentId]);

  const fetchApartment = async () => {
    try {
      setLoading(true);
      const apartmentData = await apartmentAPI.getApartmentById(apartmentId);
      setApartment(apartmentData);
    } catch (error) {
      console.error("Error fetching apartment:", error);
      toast.error("Failed to load apartment details");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApartment = async () => {
    if (!apartment) return;

    setIsDeleting(true);
    try {
      await apartmentAPI.deleteApartment(apartment._id);
      toast.success("Apartment deleted successfully");
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting apartment:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete apartment"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditApartment = () => {
    setShowEditModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPetPolicyBadge = (policy: string) => {
    const styles = {
      allowed: "bg-green-100 text-green-800",
      "not-allowed": "bg-red-100 text-red-800",
      conditional: "bg-yellow-100 text-yellow-800",
    };

    const labels = {
      allowed: "Pets Allowed",
      "not-allowed": "No Pets",
      conditional: "Pets Conditional",
    };

    return {
      style: styles[policy as keyof typeof styles] || styles.conditional,
      label: labels[policy as keyof typeof labels] || "Unknown",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingSpinner size="lg" color="black" />
            <p className="mt-4 text-gray-600">Loading apartment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Apartment not found
            </h2>
            <p className="text-gray-600 mb-4">
              The apartment you're looking for doesn't exist or has been
              removed.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Listings
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {apartment.unitName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Unit #{apartment.unitNumber} • {apartment.project}
                </p>
              </div>
              {isOwner && (
                <div className="hidden sm:flex items-center space-x-3 mt-4 sm:mt-0">
                  <button
                    onClick={handleEditApartment}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              {apartment.images && apartment.images.length > 0 ? (
                <div>
                  <div className="relative h-96 bg-gray-200">
                    <CustomImage
                      src={getImageUrl(apartment.images[currentImageIndex])}
                      alt={`${apartment.unitName} - Image ${
                        currentImageIndex + 1
                      }`}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        // Find the image container and add fallback
                        const container = target.closest(".relative");
                        if (container) {
                          const existingFallback =
                            container.querySelector(".image-fallback");
                          if (!existingFallback) {
                            const fallback = document.createElement("div");
                            fallback.className =
                              "image-fallback absolute inset-0 flex items-center justify-center bg-gray-100 cursor-pointer";
                            fallback.onclick = () => setShowImageModal(true);
                            fallback.innerHTML = `
                              <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 7.5v11.25Z" />
                              </svg>
                            `;
                            container.appendChild(fallback);
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10"
                    >
                      <CameraIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {apartment.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {apartment.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                              index === currentImageIndex
                                ? "border-gray-900"
                                : "border-gray-200"
                            }`}
                          >
                            <CustomImage
                              src={getImageUrl(image)}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                // Find the thumbnail container and add fallback
                                const container = target.closest("button");
                                if (container) {
                                  const existingFallback =
                                    container.querySelector(".thumb-fallback");
                                  if (!existingFallback) {
                                    const fallback =
                                      document.createElement("div");
                                    fallback.className =
                                      "thumb-fallback absolute inset-0 flex items-center justify-center bg-gray-100";
                                    fallback.innerHTML = `
                                      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 7.5v11.25Z" />
                                      </svg>
                                    `;
                                    container.appendChild(fallback);
                                  }
                                }
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-100 flex items-center justify-center">
                  <svg
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 7.5v11.25Z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {apartment.description}
              </p>
            </div>

            {/* Amenities */}
            {apartment.amenities && apartment.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {apartment.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lease Terms */}
            {apartment.leaseTerms && apartment.leaseTerms.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Lease Terms
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {apartment.leaseTerms.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-blue-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-blue-700">
                        {term}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                  <span className="text-3xl font-bold">
                    {formatPrice(apartment.price)}
                  </span>
                  <span className="text-lg text-gray-500 ml-1">/mo</span>
                </div>

                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      apartment.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {apartment.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {apartment.bedrooms === 0 ? "Studio" : apartment.bedrooms}
                    </div>
                    <div className="text-sm text-gray-500">
                      {apartment.bedrooms === 0 ? "" : "Bedrooms"}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {apartment.bathrooms}
                    </div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {apartment.squareFootage}
                    </div>
                    <div className="text-sm text-gray-500">Sq Ft</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center mb-3">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {apartment.address}, {apartment.city}, {apartment.state}{" "}
                      {apartment.zipCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Pet Policy</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getPetPolicyBadge(apartment.petPolicy).style
                      }`}
                    >
                      {getPetPolicyBadge(apartment.petPolicy).label}
                    </span>
                  </div>

                  {apartment.parkingSpaces > 0 && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        Parking Spaces
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {apartment.parkingSpaces}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={`mailto:${apartment.contactEmail}`}
                    className="text-gray-900 hover:text-gray-700 text-sm"
                  >
                    {apartment.contactEmail}
                  </a>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={`tel:${apartment.contactPhone}`}
                    className="text-gray-900 hover:text-gray-700 text-sm"
                  >
                    {apartment.contactPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow p-6 mb-6 block sm:hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Property
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleEditApartment}
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Property
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Property
                  </button>
                </div>
              </div>
            )}

            {/* Virtual Tour */}
            {apartment.virtualTourUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Virtual Tour
                </h3>
                <a
                  href={apartment.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <GlobeAltIcon className="h-4 w-4 mr-2" />
                  Take Virtual Tour
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && apartment.images && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              ✕
            </button>
            <CustomImage
              src={getImageUrl(apartment.images[currentImageIndex])}
              alt={`${apartment.unitName} - Image ${currentImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Edit Apartment Modal */}
      {apartment && (
        <EditApartmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            fetchApartment(); // Refresh apartment data when modal closes
          }}
          apartment={apartment}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteApartment}
        title="Delete Apartment"
        description={`Are you sure you want to delete "${apartment?.unitName}"? This action cannot be undone and will permanently remove the apartment listing.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
