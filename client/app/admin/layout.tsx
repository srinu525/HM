"use client";

import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RouteGuard } from "@/components/route-guard";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  Flag,
  DollarSign,
  Shield,
  BarChart3,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronRight,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    links: [
      { href: "/admin/organizations", label: "Organizations", icon: Building2 },
      { href: "/admin/users", label: "All Users", icon: Users },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "Finance",
    links: [
      { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
    ],
  },
  {
    label: "Control",
    links: [
      { href: "/admin/feature-flags", label: "Feature Flags", icon: Flag },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
      { href: "/admin/settings", label: "Platform Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout?.();
    router.push("/super-admin");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 border-r border-slate-800 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Super Admin</p>
              <p className="text-xs text-slate-400">Platform Control</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const active = isActive(link.href, link.exact);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
                        active
                          ? "bg-rose-500/10 text-rose-400 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <link.icon className="w-4 h-4 shrink-0" />
                      {link.label}
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-rose-400/60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.name ?? "Super Admin"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-400">System Online</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-950">
          <div className="p-4 lg:p-6">
            <RouteGuard>{children}</RouteGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
