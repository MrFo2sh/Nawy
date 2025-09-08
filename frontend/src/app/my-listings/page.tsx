"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function MyListingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main page with my=true parameter
    router.replace("/?my=true");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <LoadingSpinner size="lg" color="black" />
        <p className="mt-4 text-gray-600">Redirecting to your listings...</p>
      </div>
    </div>
  );
}
