"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to stock management by default
    router.push("/admin/stock");
  }, [router]);

  return (
    <AdminGuard>
      <div className="container mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to admin dashboard...</p>
        </div>
      </div>
    </AdminGuard>
  );
}
