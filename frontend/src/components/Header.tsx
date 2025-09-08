"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import AuthModal from "./AuthModal";
import CreateApartmentModal from "./CreateApartmentModal";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  totalApartments?: number;
}

export default function Header({ totalApartments = 0 }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMyListings = searchParams.get("my") === "true";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [createApartmentModalOpen, setCreateApartmentModalOpen] =
    useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);

    // If user is on My Listings page, redirect to home
    if (isMyListings) {
      router.push("/");
    }
  };

  const handleAddApartmentClick = () => {
    if (isAuthenticated) {
      // User is logged in, show create apartment modal
      setCreateApartmentModalOpen(true);
    } else {
      // User is not logged in, show login modal first
      openAuthModal("login");
    }
  };

  return (
    <>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo and Title */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <HomeIconSolid className="h-8 w-8 text-black mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Apartments Listing
                </h1>
                <p className="text-sm text-gray-500">By Mohamed Fouad</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleAddApartmentClick}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center shadow-lg"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Apartment
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Hi, {user?.name}</span>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${
                          isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          href="/?my=true"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <div className="flex items-center">
                            <HomeIcon className="h-4 w-4 mr-3" />
                            My Listings
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            setEditProfileModalOpen(true);
                            setIsUserDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-3" />
                            Edit Profile
                          </div>
                        </button>
                        <hr className="border-gray-200 my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                            Logout
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddApartmentClick}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center shadow-lg"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Apartment
                  </button>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-black transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/?my=true"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <HomeIcon className="h-5 w-5 mr-3" />
                        My Listings
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setEditProfileModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 mr-3" />
                        Edit Profile
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleAddApartmentClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                    >
                      <div className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-3" />
                        Add Apartment
                      </div>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal("login")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 mr-3" />
                        Login
                      </div>
                    </button>
                    <button
                      onClick={handleAddApartmentClick}
                      className="block w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                    >
                      <div className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-3" />
                        Add Apartment
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Create Apartment Modal */}
      <CreateApartmentModal
        isOpen={createApartmentModalOpen}
        onClose={() => setCreateApartmentModalOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
      />
    </>
  );
}
