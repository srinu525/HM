"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/reception": "Reception",
  "/dashboard/admin/users": "User Management",
  "/dashboard/admin/departments": "Departments",
  "/dashboard/admin/roles": "Roles & Permissions",
  "/dashboard/admin/schedules": "Doctor Schedules",
  "/dashboard/admin/settings": "Settings",
  "/dashboard/organizations": "Organizations",
  "/dashboard/billing/subscriptions": "Plans & Billing",
  "/dashboard/billing/invoices": "Invoices & Payments",
  "/dashboard/audit-logs": "Audit Logs",
  "/dashboard/patients": "Patient Registration",
  "/dashboard/appointments": "Appointments",
  "/dashboard/queue": "Queue View",
  "/dashboard/consultations": "Doctor Consultation",
  "/dashboard/prescriptions": "Prescriptions",
  "/dashboard/pharmacy": "Pharmacy",
  "/dashboard/pharmacy/inventory": "Medicine Inventory",
  "/dashboard/pharmacy/sales": "Sales",
  "/dashboard/reports": "Reports",
  "/dashboard/lab": "Lab Tests & Results",
  "/dashboard/notifications": "Notifications",
};

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const pageSubtitles: Record<string, string> = {
  "/dashboard/reception": "Register patients, book appointments, take initial checkup & manage the queue",
};

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const subtitle = pageSubtitles[pathname];

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
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
