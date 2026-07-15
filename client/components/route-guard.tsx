"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"];

const routeRoles: Record<string, string[]> = {
  "/dashboard/organizations": ["SUPER_ADMIN"],
  "/dashboard/billing": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/audit-logs": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/users": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/reception": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  "/dashboard/reception/patients": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  "/dashboard/reception/appointments": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  "/dashboard/reception/queue": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "DOCTOR"],
  "/dashboard/reception/appointments-list": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  "/dashboard/doctor": ["SUPER_ADMIN", "ADMIN", "DOCTOR"],
  "/dashboard/pharmacy": ["SUPER_ADMIN", "ADMIN", "PHARMACIST"],
  "/dashboard/pharmacy/inventory": ["SUPER_ADMIN", "ADMIN", "PHARMACIST"],
  "/dashboard/pharmacy/prescriptions": ["SUPER_ADMIN", "ADMIN", "PHARMACIST", "DOCTOR"],
  "/dashboard/pharmacy/sales": ["SUPER_ADMIN", "ADMIN", "PHARMACIST"],
  "/dashboard/reports": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  "/dashboard/lab": ["SUPER_ADMIN", "ADMIN", "DOCTOR"],
  "/dashboard/invoices": ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  "/dashboard/sales": ["SUPER_ADMIN", "ADMIN", "PHARMACIST"],
  "/dashboard/notifications": ALL_ROLES,
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
  const isAllowed = !allowed || (user && allowed.includes(user.role));

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

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 text-center max-w-md">
          You don&apos;t have permission to access this page.
          Contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
