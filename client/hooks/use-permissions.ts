"use client";

import { useAuth } from "@/contexts/auth-context";

export function usePermissions() {
  const { user, hasPermission, hasAnyPermission, hasModule } = useAuth();

  return {
    permissions: user?.permissions ?? [],
    hasPermission,
    hasAnyPermission,
    hasModule,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
  };
}
