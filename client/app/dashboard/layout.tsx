"use client";

import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { RouteGuard } from "@/components/route-guard";
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Bell,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Building2,
  CreditCard,
  History,
  TestTube,
  ChevronDown,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  label: string;
  links: SidebarLink[];
}

const roleGroups: Record<string, SidebarGroup[]> = {
  ADMIN: [
    {
      label: "Main",
      links: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Administration",
      links: [
        { href: "/dashboard/organizations", label: "Organizations", icon: Building2 },
        { href: "/dashboard/billing", label: "Subscription", icon: CreditCard },
        { href: "/dashboard/audit-logs", label: "Audit Logs", icon: History },
        { href: "/dashboard/users", label: "Users", icon: Users },
      ],
    },
    {
      label: "Patient Care",
      links: [
        { href: "/dashboard/reception", label: "Reception", icon: Calendar },
        { href: "/dashboard/reception/patients", label: "Patients", icon: Users },
        { href: "/dashboard/reception/appointments", label: "New Appointment", icon: Calendar },
        { href: "/dashboard/reception/queue", label: "Queue View", icon: Users },
        { href: "/dashboard/reception/appointments-list", label: "Appointments List", icon: FileText },
        { href: "/dashboard/doctor", label: "Doctors", icon: Stethoscope },
      ],
    },
    {
      label: "Pharmacy",
      links: [
        { href: "/dashboard/pharmacy", label: "Overview", icon: Pill },
        { href: "/dashboard/pharmacy/inventory", label: "Inventory", icon: Pill },
        { href: "/dashboard/pharmacy/sales", label: "Sales", icon: ShoppingCart },
        { href: "/dashboard/pharmacy/prescriptions", label: "Prescriptions", icon: FileText },
      ],
    },
    {
      label: "Clinical",
      links: [
        { href: "/dashboard/lab", label: "Lab", icon: TestTube },
      ],
    },
    {
      label: "Reports",
      links: [
        { href: "/dashboard/reports", label: "Appointments", icon: FileText },
        { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
      ],
    },
    {
      label: "Finance",
      links: [
        { href: "/dashboard/invoices", label: "Invoices", icon: CreditCard },
      ],
    },
    {
      label: "System",
      links: [
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
  RECEPTIONIST: [
    {
      label: "Main",
      links: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Patient Care",
      links: [
        { href: "/dashboard/reception", label: "Reception", icon: Calendar },
        { href: "/dashboard/reception/patients", label: "Patients", icon: Users },
        { href: "/dashboard/reception/appointments", label: "New Appointment", icon: Calendar },
        { href: "/dashboard/reception/queue", label: "Queue View", icon: Users },
        { href: "/dashboard/reception/appointments-list", label: "Appointments List", icon: FileText },
      ],
    },
    {
      label: "Finance",
      links: [
        { href: "/dashboard/invoices", label: "Invoices", icon: CreditCard },
      ],
    },
    {
      label: "System",
      links: [
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
  DOCTOR: [
    {
      label: "Main",
      links: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Patient Care",
      links: [
        { href: "/dashboard/reception/patients", label: "Patients", icon: Users },
        { href: "/dashboard/doctor", label: "Consultations", icon: Stethoscope },
        { href: "/dashboard/reception/queue", label: "Queue", icon: Users },
      ],
    },
    {
      label: "Pharmacy",
      links: [
        { href: "/dashboard/pharmacy/prescriptions", label: "Prescriptions", icon: FileText },
      ],
    },
    {
      label: "Clinical",
      links: [
        { href: "/dashboard/lab", label: "Lab", icon: TestTube },
      ],
    },
    {
      label: "System",
      links: [
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
  PHARMACIST: [
    {
      label: "Main",
      links: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Pharmacy",
      links: [
        { href: "/dashboard/pharmacy", label: "Overview", icon: Pill },
        { href: "/dashboard/pharmacy/inventory", label: "Inventory", icon: Pill },
        { href: "/dashboard/pharmacy/sales", label: "Sales", icon: ShoppingCart },
        { href: "/dashboard/pharmacy/prescriptions", label: "Prescriptions", icon: FileText },
      ],
    },
    {
      label: "Clinical",
      links: [
        { href: "/dashboard/lab", label: "Lab", icon: TestTube },
      ],
    },
    {
      label: "System",
      links: [
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groups = user ? (roleGroups[user.role] || []) : [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleGroup = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
          {groups.map((group) => {
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
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
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
