"use client";

import { createContext, useContext, useState, useMemo, useSyncExternalStore, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, organizationSlug: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [user, setUser] = useState<User | null>(null);
  const isLoading = !hydrated;

  if (hydrated && user === null) {
    const saved = getInitialUser();
    if (saved) setUser(saved);
  }

  const login = async (email: string, password: string, organizationSlug: string) => {
    const response = await api.post("/auth/login", { email, password, organizationSlug });
    const { user: userData, token } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(() => ({ user, login, logout, isLoading }), [user, isLoading]);

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
