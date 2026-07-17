"use client";

import { useEffect, useState } from "react";
import { statsApi } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";

interface SystemAnalytics {
  revenue: { month: string; total: number }[];
  topOrgs: { name: string; patients: number; revenue: number }[];
  appointmentsByStatus: { status: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getSystemAnalytics().then((res) => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load analytics</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500 mt-1">Platform-wide analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Monthly Revenue</h3>
          {data.revenue.length === 0 ? (
            <p className="text-sm text-gray-500">No revenue data yet</p>
          ) : (
            <div className="space-y-2">
              {data.revenue.slice(0, 6).map((r) => (
                <div key={r.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{r.month}</span>
                  <span className="font-medium text-gray-900">₹{r.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Top Organizations</h3>
          {data.topOrgs.length === 0 ? (
            <p className="text-sm text-gray-500">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topOrgs.slice(0, 5).map((org, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{org.name}</div>
                    <div className="text-xs text-gray-500">{org.patients} patients</div>
                  </div>
                  <span className="font-medium text-gray-900">₹{org.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Appointments by Status</h3>
          {data.appointmentsByStatus.length === 0 ? (
            <p className="text-sm text-gray-500">No appointment data</p>
          ) : (
            <div className="space-y-2">
              {data.appointmentsByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{s.status}</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
