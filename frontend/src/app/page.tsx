"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchDebounce } from "../hooks/useDebounce";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import CustomImage from "../components/CustomImage";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import { apartmentAPI } from "../lib/api";
import { Apartment, ApartmentFilters } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Header from "../components/Header";
import CreateApartmentModal from "../components/CreateApartmentModal";
import EditApartmentModal from "../components/EditApartmentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { useAuth } from "../hooks/useAuth";

export default function ApartmentsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMyListings = searchParams.get("my") === "true";

  // Search functionality with debouncing
  const { searchInput, debouncedSearchValue, isSearching, setSearchInput } =
    useSearchDebounce("", 500);

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalApartments, setTotalApartments] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const [filters, setFilters] = useState<ApartmentFilters>({
    page: 1,
    limit: 12,
    search: "",
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    city: "",
    state: "",
    project: "",
    isAvailable: undefined,
    petPolicy: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Temporary filters that are being edited but not yet applied
  const [tempFilters, setTempFilters] = useState<ApartmentFilters>(filters);

  // Check if there are unsaved filter changes
  const hasFilterChanges =
    JSON.stringify(filters) !== JSON.stringify(tempFilters);

  const fetchApartments = async () => {
    try {
      setLoading(true);

      // If we're in My Listings mode and auth is still loading, wait
      if (isMyListings && authLoading) {
        return;
      }

      let result;
      if (isMyListings) {
        // Fetch user's apartments
        if (!isAuthenticated) {
          setApartments([]);
          setTotalPages(0);
          setTotalApartments(0);
          // Don't show error toast if user is logging out
          if (!isLoggingOut) {
            toast.error("Please log in to view your listings");
          }
          return;
        }
        result = await apartmentAPI.getMyApartments({
          ...filters,
          page: currentPage,
          search: debouncedSearchValue || undefined,
        });
      } else {
        // Fetch all apartments
        result = await apartmentAPI.getApartments({
          ...filters,
          page: currentPage,
          search: debouncedSearchValue || undefined,
        });
      }

      setApartments(result.data);
      setTotalPages(result.pagination.pages);
      setTotalApartments(result.pagination.total);
    } catch (error: any) {
      console.error("Error fetching apartments:", error);

      // Handle authentication errors for My Listings
      if (isMyListings && error.message?.includes("Invalid token")) {
        // Clear invalid token data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        // Set empty state
        setApartments([]);
        setTotalPages(0);
        setTotalApartments(0);
        toast.error(
          "Your session has expired. Please log in again to view your listings."
        );
        // Reload the page to update auth state
        setTimeout(() => window.location.reload(), 1000);
        return;
      }

      toast.error(
        isMyListings
          ? "Failed to load your listings"
          : "Failed to load apartments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, [
    filters,
    currentPage,
    debouncedSearchValue,
    isMyListings,
    isAuthenticated,
    authLoading,
  ]);

  // Track logout to prevent error toast when user logs out
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setIsLoggingOut(true);
      // Reset logout state after a short delay
      const timer = setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading]);

  const handleFilterChange = (newFilters: Partial<ApartmentFilters>) => {
    setTempFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTempFilters(filters);
  };

  const handleSearchInput = useCallback((query: string) => {
    setSearchInput(query);
    setCurrentPage(1);
  }, []);

  const clearFilters = () => {
    const clearedFilters: ApartmentFilters = {
      page: 1,
      limit: 12,
      search: "",
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      city: "",
      state: "",
      project: "",
      isAvailable: undefined,
      petPolicy: undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as "desc",
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setSearchInput("");
    setCurrentPage(1);
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

  const handleEditApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setShowEditModal(true);
  };

  const handleDeleteApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setShowDeleteModal(true);
  };

  const confirmDeleteApartment = async () => {
    if (!selectedApartment) return;

    setIsDeleting(true);
    try {
      await apartmentAPI.deleteApartment(selectedApartment._id);
      toast.success("Apartment deleted successfully!");
      setShowDeleteModal(false);
      setSelectedApartment(null);
      fetchApartments(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting apartment:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete apartment"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && apartments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header totalApartments={totalApartments} />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingSpinner size="lg" color="black" />
            <p className="mt-4 text-gray-600">
              {isMyListings
                ? "Loading your listings..."
                : "Loading apartments..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header totalApartments={totalApartments} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title for My Listings */}
        {isMyListings && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Listings
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  My Listings
                </h1>
                <p className="text-gray-600">
                  Manage your apartment listings
                  {totalApartments > 0 &&
                    ` (${totalApartments} listing${
                      totalApartments === 1 ? "" : "s"
                    })`}
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg sm:hidden"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Apartment
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="space-y-4">
            {/* Title and Add Button for general listings */}
            {!isMyListings && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Find Your Perfect Apartment
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {totalApartments > 0 &&
                      `Browse ${totalApartments} available apartments`}
                  </p>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg sm:hidden"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Apartment
                  </button>
                )}
              </div>
            )}
            {/* Search Bar with Filter Button */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <div
                  className={`absolute right-3 top-3 transition-opacity duration-200 ${
                    isSearching ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <LoadingSpinner size="sm" color="gray" />
                </div>
                <input
                  type="text"
                  placeholder={
                    isMyListings
                      ? "Search your apartments by unit name, unit number, or project..."
                      : "Search apartments by unit name, unit number, or project..."
                  }
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
              </div>
              {!isMyListings && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 sm:px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Filters</span>
                </button>
              )}
            </div>{" "}
            {/* Filters Panel */}
            {!isMyListings && showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="Min price"
                      value={tempFilters.minPrice || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          minPrice: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Max price"
                      value={tempFilters.maxPrice || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          maxPrice: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <select
                      value={tempFilters.bedrooms || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          bedrooms: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="input-field"
                    >
                      <option value="">Any</option>
                      <option value="0">Studio</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={tempFilters.city || ""}
                      onChange={(e) =>
                        handleFilterChange({ city: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Policy
                    </label>
                    <select
                      value={tempFilters.petPolicy || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          petPolicy: (e.target.value as any) || undefined,
                        })
                      }
                      className="input-field"
                    >
                      <option value="">Any</option>
                      <option value="allowed">Pets Allowed</option>
                      <option value="not-allowed">No Pets</option>
                      <option value="conditional">Conditional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={`${tempFilters.sortBy}-${tempFilters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split("-");
                        handleFilterChange({
                          sortBy,
                          sortOrder: sortOrder as "asc" | "desc",
                        });
                      }}
                      className="input-field"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="unitName-asc">Name: A to Z</option>
                      <option value="unitName-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button onClick={clearFilters} className="btn-secondary">
                    Clear Filters
                  </button>

                  {hasFilterChanges && (
                    <div className="flex gap-2">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyFilters}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Apartments Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" color="black" />
              <p className="mt-4 text-gray-600">Loading more apartments...</p>
            </div>
          </div>
        ) : apartments.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isMyListings ? "No listings found" : "No apartments found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {isMyListings
                ? !isAuthenticated
                  ? "Please log in to view your apartment listings."
                  : "You haven't created any apartment listings yet. Click 'Add Apartment' to get started."
                : "Try adjusting your search criteria or filters"}
            </p>
            {isMyListings && !isAuthenticated && (
              <button
                onClick={() => {
                  // Redirect to home page to trigger login modal
                  window.location.href = "/";
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apartments.map((apartment) => (
              <div
                key={apartment._id}
                className="card-hover cursor-pointer"
                onClick={() => router.push(`/apartments/${apartment._id}`)}
              >
                {/* Apartment Image */}
                <div className="relative bg-gray-200 h-48 w-full">
                  {apartment.images && apartment.images.length > 0 ? (
                    <>
                      <CustomImage
                        src={getImageUrl(apartment.images[0])}
                        alt={apartment.unitName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                                "image-fallback absolute inset-0 flex items-center justify-center bg-gray-100";
                              fallback.innerHTML = `
                                <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 7.5v11.25Z" />
                                </svg>
                              `;
                              container.insertBefore(
                                fallback,
                                container.lastElementChild
                              );
                            }
                          }
                        }}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <svg
                        className="h-12 w-12 text-gray-400"
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

                  {/* Availability Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        apartment.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {apartment.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* Apartment Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {apartment.unitName}
                    </h3>
                    <span className="text-sm text-gray-500">
                      #{apartment.unitNumber}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {apartment.project}
                  </p>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {apartment.city}, {apartment.state}
                    </span>
                  </div>

                  <div className="flex items-center text-green-600 mb-3">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    <span className="text-xl font-bold">
                      {formatPrice(apartment.price)}/mo
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>
                      {apartment.bedrooms === 0
                        ? "Studio"
                        : `${apartment.bedrooms} bed`}
                    </span>
                    <span>{apartment.bathrooms} bath</span>
                    <span>{apartment.squareFootage} sq ft</span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getPetPolicyBadge(apartment.petPolicy).style
                      }`}
                    >
                      {getPetPolicyBadge(apartment.petPolicy).label}
                    </span>

                    {apartment.parkingSpaces > 0 && (
                      <span className="text-xs text-gray-500">
                        {apartment.parkingSpaces} parking
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {apartment.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {apartment.amenities.slice(0, 2).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {amenity}
                        </span>
                      ))}
                      {apartment.amenities.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{apartment.amenities.length - 2} more
                        </span>
                      )}
                    </div>

                    {isMyListings ? (
                      // Actions for My Listings mode
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditApartment(apartment);
                          }}
                          className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApartment(apartment);
                          }}
                          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    ) : (
                      // View Details button for general listings
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/apartments/${apartment._id}`);
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Create Apartment Modal */}
      <CreateApartmentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          fetchApartments(); // Refresh the list when modal closes
        }}
      />

      {/* Edit Apartment Modal */}
      {selectedApartment && (
        <EditApartmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedApartment(null);
            fetchApartments(); // Refresh the list when modal closes
          }}
          apartment={selectedApartment}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedApartment(null);
        }}
        onConfirm={confirmDeleteApartment}
        title="Delete Apartment"
        description={`Are you sure you want to delete "${selectedApartment?.unitName}"? This action cannot be undone and will permanently remove the apartment listing.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
