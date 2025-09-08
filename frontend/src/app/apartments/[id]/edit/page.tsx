"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { apartmentAPI } from "../../../../lib/api";
import { Apartment } from "../../../../types";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import Header from "../../../../components/Header";
import EditApartmentModal from "../../../../components/EditApartmentModal";

export default function EditApartmentPage() {
  const params = useParams();
  const router = useRouter();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);

  const apartmentId = params.id as string;

  useEffect(() => {
    fetchApartment();
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

  const handleClose = () => {
    router.push(`/apartments/${apartmentId}`);
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Apartment not found
            </h2>
            <p className="text-gray-600 mb-4">
              The apartment you're trying to edit doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <EditApartmentModal
          isOpen={true}
          onClose={handleClose}
          apartment={apartment}
        />
      </div>
    </div>
  );
}
