"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAdminSessionValid,
  getAdminSession,
  adminLogout,
  AdminSession,
} from "@/lib/admin-auth-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield, User } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAdminSessionValid();
      const currentSession = await getAdminSession();

      setIsAuthorized(result.valid);
      setSession(currentSession);

      if (!result.valid) {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  // Show loading while checking auth
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <p className="text-gray-600 text-sm">
              You are not authorized to access this area.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/admin/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authorized content with admin header
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-300">
                Welcome, {session?.username} • Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="w-4 h-4" />
              <span>{session?.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-2">
        <nav className="flex gap-6">
          <a
            href="/admin/stock"
            className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700 rounded-md transition-colors"
          >
            Stock Management
          </a>
          <a
            href="/admin/products"
            className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700 rounded-md transition-colors"
          >
            Add Products
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
