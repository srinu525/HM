"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Building2, Users, Stethoscope, Calendar, DollarSign, Activity, TrendingUp, UserPlus } from "lucide-react";

interface PlatformStats {
  totalOrgs: number;
  activeOrgs: number;
  totalUsers: number;
  activeUsers: number;
  totalPatients: number;
  todayAppointments: number;
  todayRevenue: number;
  recentPatients: number;
  totalMedicines: number;
  recentUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then((res) => {
      setStats(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg text-gray-500">Loading platform stats...</div></div>;
  }

  if (!stats) {
    return <div className="text-center text-gray-500 py-12">Failed to load platform stats</div>;
  }

  const statCards = [
    { label: "Total Organizations", value: stats.totalOrgs, sub: `${stats.activeOrgs} active`, icon: Building2, color: "from-blue-600 to-cyan-600" },
    { label: "Total Users", value: stats.totalUsers, sub: `${stats.activeUsers} active`, icon: Users, color: "from-green-600 to-emerald-600" },
    { label: "Total Patients", value: stats.totalPatients, sub: `${stats.recentPatients} new (30d)`, icon: Stethoscope, color: "from-purple-600 to-violet-600" },
    { label: "Today's Appointments", value: stats.todayAppointments, sub: "", icon: Calendar, color: "from-orange-600 to-amber-600" },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, sub: "", icon: DollarSign, color: "from-red-600 to-pink-600" },
    { label: "Recent Users (30d)", value: stats.recentUsers, sub: "new signups", icon: UserPlus, color: "from-teal-600 to-cyan-600" },
    { label: "Active Medicines", value: stats.totalMedicines, sub: "in inventory", icon: Activity, color: "from-indigo-600 to-blue-600" },
    { label: "User Engagement", value: `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`, sub: "active rate", icon: TrendingUp, color: "from-pink-600 to-rose-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all hospitals and system health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{card.value}</div>
            {card.sub && <div className="text-sm text-gray-500 mt-1">{card.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
