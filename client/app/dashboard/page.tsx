"use client";

import { useAuth } from "@/contexts/auth-context";
import { DashboardAnalytics } from "@/components/dashboard-analytics";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening in your {user?.role?.toLowerCase()} dashboard today.
        </p>
      </div>

      <DashboardAnalytics />
    </div>
  );
}
