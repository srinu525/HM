"use client";

import { useEffect, useState } from "react";
import { adminApi, statsApi } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Calendar, Activity, Building2, Stethoscope } from "lucide-react";

function Bar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 2;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-300 w-16 text-right shrink-0">{value.toLocaleString()}</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsApi.getSystemAnalytics(),
      adminApi.getRevenue(),
      adminApi.getOrganizations(),
    ]).then(([aRes, rRes, oRes]) => {
      setAnalyticsData(aRes.data.data ?? []);
      setRevenueData(rRes.data.data ?? []);
      setOrgs(oRes.data.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Last 14 days from analytics
  const last14 = analyticsData.slice(-14);
  const maxAppointments = Math.max(...last14.map((d: any) => d.appointments), 1);
  const maxPatients = Math.max(...last14.map((d: any) => d.patients), 1);

  // Top orgs by revenue
  const topOrgs = [...revenueData].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 8);
  const maxRev = topOrgs[0]?.totalRevenue ?? 1;

  // Org stats
  const activeOrgs = orgs.filter((o: any) => o.isActive).length;
  const orgsWithSub = orgs.filter((o: any) => o.subscriptions?.length > 0).length;
  const totalUsers = orgs.reduce((s: number, o: any) => s + (o._count?.users ?? 0), 0);
  const totalPatients = orgs.reduce((s: number, o: any) => s + (o._count?.patients ?? 0), 0);

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-64" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Platform-wide usage and growth trends</p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Orgs", value: activeOrgs, icon: Building2, color: "text-sky-400" },
          { label: "Subscribed Orgs", value: orgsWithSub, icon: BarChart3, color: "text-violet-400" },
          { label: "Total Staff Users", value: totalUsers, icon: Users, color: "text-emerald-400" },
          { label: "Total Patients", value: totalPatients.toLocaleString(), icon: Stethoscope, color: "text-pink-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 shrink-0 ${s.color}`} />
            <div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily appointments (last 14d) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Daily Appointments (Last 14 Days)</h3>
          </div>
          {last14.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No appointment data yet</p>
          ) : (
            <div className="space-y-2">
              {last14.map((d: any) => (
                <Bar key={d.date}
                  label={new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  value={d.appointments} max={maxAppointments} color="bg-blue-500/70" />
              ))}
            </div>
          )}
        </div>

        {/* Daily new patients */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Daily New Patients (Last 14 Days)</h3>
          </div>
          {last14.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No patient data yet</p>
          ) : (
            <div className="space-y-2">
              {last14.map((d: any) => (
                <Bar key={d.date}
                  label={new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  value={d.patients} max={maxPatients} color="bg-violet-500/70" />
              ))}
            </div>
          )}
        </div>

        {/* Top orgs by revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Top Organizations by Revenue</h3>
          </div>
          {topOrgs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No revenue data yet</p>
          ) : (
            <div className="space-y-2">
              {topOrgs.map((org) => (
                <Bar key={org.orgId} label={org.name}
                  value={org.totalRevenue} max={maxRev} color="bg-emerald-500/60" />
              ))}
            </div>
          )}
        </div>

        {/* Daily revenue trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Daily Revenue Trend (Last 14 Days)</h3>
          </div>
          {last14.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
          ) : (() => {
            const maxRev14 = Math.max(...last14.map((d: any) => d.revenue ?? 0), 1);
            return (
              <div className="space-y-2">
                {last14.map((d: any) => (
                  <Bar key={d.date}
                    label={new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    value={d.revenue ?? 0} max={maxRev14} color="bg-amber-500/60" />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
