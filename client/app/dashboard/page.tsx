"use client";

import { useAuth } from "@/contexts/auth-context";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { DoctorDashboard, PharmacistDashboard, ReceptionistDashboard } from "@/components/role-dashboards";

export default function DashboardPage() {
  const { user } = useAuth();

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case "DOCTOR":
        return <DoctorDashboard />;
      case "PHARMACIST":
        return <PharmacistDashboard />;
      case "RECEPTIONIST":
        return <ReceptionistDashboard />;
      default:
        return <DashboardAnalytics />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening in your {user?.role?.toLowerCase()} dashboard today.
        </p>
      </div>

      {renderRoleDashboard()}
    </div>
  );
}
