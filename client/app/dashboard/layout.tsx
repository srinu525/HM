"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">HM System</h1>
          <p className="text-sm text-gray-500 mt-1">{user.name}</p>
          <p className="text-xs text-gray-400">{user.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  );
}
