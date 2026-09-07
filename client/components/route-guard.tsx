"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

interface RoutePermission {
  permissions?: string[];
  module?: string;
  roles?: string[];
}

const routePermissions: Record<string, RoutePermission> = {
  "/dashboard/reception": { roles: ["RECEPTIONIST"] },
  "/dashboard/patients": { module: "patients" },
  "/dashboard/appointments": { module: "appointments" },
  "/dashboard/queue": { module: "appointments" },
  "/dashboard/consultations": { module: "consultations" },
  "/dashboard/prescriptions": { module: "prescriptions" },
  "/dashboard/pharmacy": { module: "pharmacy" },
  "/dashboard/pharmacy/inventory": { module: "pharmacy" },
  "/dashboard/pharmacy/sales": { module: "pharmacy" },
  "/dashboard/lab": { module: "lab" },
  "/dashboard/billing/invoices": { module: "invoices" },
  "/dashboard/billing/subscriptions": { roles: ["ADMIN"] },
  "/dashboard/admin/users": { roles: ["ADMIN"] },
  "/dashboard/admin/departments": { roles: ["ADMIN"] },
  "/dashboard/admin/roles": { roles: ["ADMIN"] },
  "/dashboard/admin/schedules": { roles: ["ADMIN"] },
  "/dashboard/admin/settings": { roles: ["ADMIN"] },
  "/dashboard/organizations": { roles: ["ADMIN"] },
  "/dashboard/audit-logs": { roles: ["ADMIN", "SUPER_ADMIN"] },
  "/dashboard/reports": { roles: ["ADMIN", "RECEPTIONIST"] },
  "/patient": { roles: ["PATIENT"] },
  "/patient/appointments": { roles: ["PATIENT"] },
  "/patient/prescriptions": { roles: ["PATIENT"] },
  "/patient/lab-results": { roles: ["PATIENT"] },
  "/patient/invoices": { roles: ["PATIENT"] },
  "/patient/profile": { roles: ["PATIENT"] },
};

function matchRoute(pathname: string): RoutePermission | null {
  if (routePermissions[pathname]) return routePermissions[pathname];
  const sorted = Object.keys(routePermissions).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (pathname.startsWith(prefix + "/") || pathname === prefix) {
      return routePermissions[prefix];
    }
  }
  return null;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasPermission, hasAnyPermission, hasModule } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const routeConfig = matchRoute(pathname);
  const isAllowed = !routeConfig || isSuperAdminOrAllowed(user?.role, routeConfig, hasPermission, hasAnyPermission, hasModule);

  useEffect(() => {
    if (!isLoading && !user) {
      const savedSlug = localStorage.getItem("orgSlug") || "default-hospital";
      const role = localStorage.getItem("userRole");
      if (role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else {
        router.push(`/${savedSlug}/login`);
      }
    }
    // Redirect super admin away from /dashboard to /admin
    if (!isLoading && user?.role === "SUPER_ADMIN" && pathname.startsWith("/dashboard")) {
      router.replace("/admin");
    }
    // Redirect non-super-admins away from /admin
    if (!isLoading && user && user.role !== "SUPER_ADMIN" && pathname.startsWith("/admin")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, pathname]);

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

function isSuperAdminOrAllowed(
  role: string | undefined,
  config: RoutePermission,
  hasPermission: (p: string) => boolean,
  hasAnyPermission: (...p: string[]) => boolean,
  hasModule: (m: string) => boolean,
): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (config.roles && config.roles.length > 0) return config.roles.includes(role ?? "");
  if (config.module) return hasModule(config.module);
  if (config.permissions && config.permissions.length > 0) return hasAnyPermission(...config.permissions);
  return true;
}
