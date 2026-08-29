"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, organizationSlug: string) => Promise<void>;
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
  if (!savedUser) return null;
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
    setUser(userData);
    setLoaded(true);
  }, []);

  const logout = useCallback(() => {
    const savedSlug = localStorage.getItem("orgSlug") || "default-hospital";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("orgSlug");
    setUser(null);
    window.location.href = `/${savedSlug}/login`;
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
    user, login, logout, isLoading, hasPermission, hasAnyPermission, hasModule,
  }), [user, login, logout, isLoading, hasPermission, hasAnyPermission, hasModule]);

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
