"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, organizationSlug: string) => Promise<void>;
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasModule: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null;
  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");
  if (!savedUser || !savedToken) return null;
  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = getInitialUser();
    if (saved) setUser(saved);
    setLoaded(true);
  }, []);

  const isLoading = !loaded;

  const login = useCallback(async (email: string, password: string, organizationSlug: string) => {
    const response = await api.post("/auth/login", { email, password, organizationSlug });
    const { user: userData, token } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);
    setUser(userData);
    setLoaded(true);
  }, []);

  const loginSuperAdmin = useCallback(async (email: string, password: string) => {
    const response = await api.post("/auth/login-super-admin", { email, password });
    const { user: userData, token } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", "SUPER_ADMIN");
    setUser(userData);
    setLoaded(true);
  }, []);

  const logout = useCallback(() => {
    const role = localStorage.getItem("userRole");
    const savedSlug = localStorage.getItem("orgSlug") || "default-hospital";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("orgSlug");
    localStorage.removeItem("userRole");
    setUser(null);
    // Super admins go back to the super admin login, not the org login
    if (role === "SUPER_ADMIN") {
      window.location.href = "/super-admin";
    } else {
      window.location.href = `/${savedSlug}/login`;
    }
  }, []);

  const permissions = user?.permissions ?? [];

  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((...perms: string[]) => {
    return perms.some((p) => permissions.includes(p));
  }, [permissions]);

  const hasModule = useCallback((module: string) => {
    return permissions.some((p) => p.startsWith(module + "."));
  }, [permissions]);

  const value = useMemo(() => ({
    user, login, loginSuperAdmin, logout, isLoading, hasPermission, hasAnyPermission, hasModule,
  }), [user, login, loginSuperAdmin, logout, isLoading, hasPermission, hasAnyPermission, hasModule]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
