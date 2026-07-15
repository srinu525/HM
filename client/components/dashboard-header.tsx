"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/users": "User Management",
  "/dashboard/reception": "Reception",
  "/dashboard/reception/patients": "Patient Registration",
  "/dashboard/reception/appointments": "New Appointment",
  "/dashboard/reception/queue": "Queue View",
  "/dashboard/reception/appointments-list": "Appointments List",
  "/dashboard/doctor": "Doctor Consultation",
  "/dashboard/pharmacy": "Pharmacy",
  "/dashboard/pharmacy/inventory": "Medicine Inventory",
  "/dashboard/pharmacy/sales": "Sales",
  "/dashboard/pharmacy/prescriptions": "Prescriptions",
  "/dashboard/reports": "Appointment Reports",
  "/dashboard/sales": "Sales Reports",
  "/dashboard/notifications": "Notifications",
};

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
