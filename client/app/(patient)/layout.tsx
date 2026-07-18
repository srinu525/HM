"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Pill, TestTube, CreditCard, UserRound, LayoutDashboard, LogOut } from "lucide-react";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const patientLinks = [
  { href: "/patient", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
  { href: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/patient/lab-results", label: "Lab Reports", icon: TestTube },
  { href: "/patient/invoices", label: "Pay Bills", icon: CreditCard },
  { href: "/patient/profile", label: "My Profile", icon: UserRound },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    setLoaded(true);
    if (!u) router.push("/patient/login");
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/patient/login");
  };

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <UserRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Patient Portal
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {patientLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors duration-200"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3 py-2 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-emerald-800 truncate">{user.name}</p>
            <p className="text-xs text-emerald-600 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-500">
              {user?.organization?.name || "Patient Portal"}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
