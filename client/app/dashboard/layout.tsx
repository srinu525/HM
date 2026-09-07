"use client";

import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { RouteGuard } from "@/components/route-guard";
import {
  Users, Calendar, Stethoscope, Pill, Bell, LayoutDashboard,
  FileText, ShoppingCart, Building2, CreditCard, History, TestTube,
  ChevronDown, Settings, Shield, Building, CalendarClock,
} from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  module?: string;
  roles?: string[];
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
  module?: string;
}

const sidebarConfig: SidebarGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Reception",
    items: [
      { href: "/dashboard/reception", label: "Reception", icon: Calendar, roles: ["RECEPTIONIST"] },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/dashboard/patients", label: "Patients", icon: Users, roles: ["DOCTOR"] },
      { href: "/dashboard/consultations", label: "Consultations", icon: Stethoscope, roles: ["DOCTOR"] },
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: FileText, roles: ["DOCTOR"] },
      { href: "/dashboard/lab", label: "Lab", icon: TestTube, roles: ["DOCTOR", "PHARMACIST"] },
    ],
  },
  {
    label: "Pharmacy",
    module: "pharmacy",
    items: [
      { href: "/dashboard/pharmacy", label: "Overview", icon: Pill, module: "pharmacy", roles: ["PHARMACIST"] },
      { href: "/dashboard/pharmacy/inventory", label: "Inventory", icon: Pill, module: "pharmacy", roles: ["PHARMACIST"] },
      { href: "/dashboard/pharmacy/sales", label: "Sales", icon: ShoppingCart, module: "pharmacy", roles: ["PHARMACIST"] },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/billing/invoices", label: "Invoices", icon: CreditCard, module: "invoices" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/dashboard/admin/users", label: "Users", icon: Users, roles: ["ADMIN"] },
      { href: "/dashboard/admin/departments", label: "Departments", icon: Building, roles: ["ADMIN"] },
      { href: "/dashboard/admin/roles", label: "Roles & Permissions", icon: Shield, roles: ["ADMIN"] },
      { href: "/dashboard/admin/schedules", label: "Schedules", icon: CalendarClock, roles: ["ADMIN"] },
      { href: "/dashboard/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
      { href: "/dashboard/organizations", label: "Organizations", icon: Building2, roles: ["ADMIN"] },
      { href: "/dashboard/billing/subscriptions", label: "Subscription", icon: CreditCard, roles: ["ADMIN"] },
      { href: "/dashboard/audit-logs", label: "Audit Logs", icon: History, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/dashboard/reports", label: "Reports", icon: FileText, roles: ["ADMIN", "RECEPTIONIST"] },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell, module: "notifications" },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, hasPermission, hasModule } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>("Main");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    for (const group of sidebarConfig) {
      for (const item of group.items) {
        if (pathname === item.href || pathname.startsWith(item.href + "/")) {
          setExpanded(group.label);
          return;
        }
      }
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const isItemVisible = (item: SidebarItem) => {
    if (!mounted || isLoading) return true;
    if (isSuperAdmin) return true;
    if (item.roles && item.roles.length > 0) return item.roles.includes(user?.role ?? "");
    if (item.permission) return hasPermission(item.permission);
    if (item.module) return hasModule(item.module);
    return true;
  };

  const visibleGroups = sidebarConfig
    .filter((group) => {
      if (!mounted || isLoading) return true;
      if (isSuperAdmin) return true;
      if (group.module && !hasModule(group.module) && group.items.every((item) => !isItemVisible(item))) {
        return false;
      }
      return group.items.some((item) => isItemVisible(item));
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isItemVisible(item)),
    }));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Show full-screen loader until auth resolves — prevents sidebar flash */}
      {(!mounted || isLoading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                HM System
              </h1>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleGroups.map((group) => {
            const isOpen = expanded === group.label;
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors duration-200"
                >
                  {group.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          pathname === item.href
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <RouteGuard>{children}</RouteGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
