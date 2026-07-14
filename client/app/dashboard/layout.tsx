"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Bell,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const roleLinks: Record<string, { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/reception", label: "Reception", icon: Calendar },
    { href: "/dashboard/doctor", label: "Doctors", icon: Stethoscope },
    { href: "/dashboard/pharmacy", label: "Pharmacy", icon: Pill },
    { href: "/dashboard/reports", label: "Appointment Reports", icon: LayoutDashboard },
    { href: "/dashboard/sales", label: "Sales Reports", icon: LayoutDashboard },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
  RECEPTIONIST: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/reception", label: "Reception", icon: Calendar },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
  DOCTOR: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/doctor", label: "Consultations", icon: Stethoscope },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
  PHARMACIST: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/pharmacy", label: "Pharmacy", icon: Pill },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const links = roleLinks[user.role] || [];

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
          <div className="flex items-center gap-3 mb-3">
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
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
