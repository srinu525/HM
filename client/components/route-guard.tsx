"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "PATIENT"];
const HOSPITAL_ROLES = ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"];

const routeRoles: Record<string, string[]> = {
  "/admin": ["SUPER_ADMIN"],
  "/admin/organizations": ["SUPER_ADMIN"],
  "/admin/users": ["SUPER_ADMIN"],
  "/admin/revenue": ["SUPER_ADMIN"],
  "/admin/feature-flags": ["SUPER_ADMIN"],
  "/admin/subscriptions": ["SUPER_ADMIN"],
  "/admin/analytics": ["SUPER_ADMIN"],
  "/admin/settings": ["SUPER_ADMIN"],
  "/dashboard": HOSPITAL_ROLES,
  "/dashboard/organizations": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/billing": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/audit-logs": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/users": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/reception": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/reception/patients": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/reception/appointments": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/reception/queue": ["ADMIN", "RECEPTIONIST", "DOCTOR"],
  "/dashboard/reception/appointments-list": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/doctor": ["ADMIN", "DOCTOR"],
  "/dashboard/pharmacy": ["ADMIN", "PHARMACIST"],
  "/dashboard/pharmacy/inventory": ["ADMIN", "PHARMACIST"],
  "/dashboard/pharmacy/prescriptions": ["ADMIN", "PHARMACIST", "DOCTOR"],
  "/dashboard/pharmacy/sales": ["ADMIN", "PHARMACIST"],
  "/dashboard/reports": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/lab": ["ADMIN", "DOCTOR", "PHARMACIST"],
  "/dashboard/invoices": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/sales": ["ADMIN", "PHARMACIST"],
  "/dashboard/notifications": HOSPITAL_ROLES,
  "/patient": ["PATIENT"],
  "/patient/appointments": ["PATIENT"],
  "/patient/prescriptions": ["PATIENT"],
  "/patient/lab-results": ["PATIENT"],
  "/patient/invoices": ["PATIENT"],
  "/patient/profile": ["PATIENT"],
};

function getAllowedRoles(pathname: string): string[] | null {
  if (routeRoles[pathname]) return routeRoles[pathname];

  const sorted = Object.keys(routeRoles).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (pathname.startsWith(prefix + "/") || pathname === prefix) {
      return routeRoles[prefix];
    }
  }
  return null;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = getAllowedRoles(pathname);
  const isAllowed = allowed !== null && user && allowed.includes(user.role);

  useEffect(() => {
    console.log("RouteGuard", { pathname, user, isLoading, allowed });
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname, allowed]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAllowed) {
    const homeRoute = user.role === "SUPER_ADMIN" ? "/admin" : user.role === "PATIENT" ? "/patient" : "/dashboard";
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 text-center max-w-md">
          You don&apos;t have permission to access this page.
          Contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => router.push(homeRoute)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
