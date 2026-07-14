"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, todayRevenue: 0 });

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500">
          {user?.role} Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Today&apos;s Appointments</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Revenue Today</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.todayRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
