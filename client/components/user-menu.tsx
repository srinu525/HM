"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, ChevronDown, Shield, Stethoscope, Pill, Calendar } from "lucide-react";

const roleConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700", icon: Shield },
  RECEPTIONIST: { label: "Receptionist", color: "bg-blue-100 text-blue-700", icon: Calendar },
  DOCTOR: { label: "Doctor", color: "bg-green-100 text-green-700", icon: Stethoscope },
  PHARMACIST: { label: "Pharmacist", color: "bg-orange-100 text-orange-700", icon: Pill },
};

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const roleInfo = roleConfig[user.role] || { label: user.role, color: "bg-gray-100 text-gray-700", icon: User };
  const RoleIcon = roleInfo.icon;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <div className="flex items-center gap-1.5">
            <RoleIcon className="h-3 w-3" />
            <p className="text-xs text-gray-500">{roleInfo.label}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            <Badge className={`mt-2 ${roleInfo.color}`} variant="secondary">
              {roleInfo.label}
            </Badge>
          </div>
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
