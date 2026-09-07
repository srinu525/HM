"use client";

import { useAuth } from "@/contexts/auth-context";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { SuperAdminDashboard, DoctorDashboard, PharmacistDashboard, ReceptionistDashboard, AdminDashboard } from "@/components/role-dashboards";

export default function DashboardPage() {
  const { user } = useAuth();

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return <SuperAdminDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
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
      {renderRoleDashboard()}
    </div>
  );
}
