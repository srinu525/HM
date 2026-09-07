"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import Link from "next/link";
import {
  Building2, Users, Stethoscope, Calendar, DollarSign,
  Activity, TrendingUp, UserPlus, CreditCard, TrendingDown,
  BarChart3, ArrowUpRight, Zap, Globe, ShieldAlert,
} from "lucide-react";

interface PlatformStats {
  totalOrgs: number; activeOrgs: number;
  totalUsers: number; activeUsers: number;
  totalPatients: number;
  todayAppointments: number; todayRevenue: number;
  recentPatients: number; totalMedicines: number; recentUsers: number;
  activeSubscriptions: number; cancelledThisMonth: number; newSubsThisMonth: number;
  mrr: number; arr: number;
}

function KpiCard({ label, value, sub, icon: Icon, accent, href }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; href?: string;
}) {
  const inner = (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center shrink-0`}>
          <Icon className="w-[18px] h-[18px] text-white" />
        </div>
        {href && (
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        )}
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs font-medium text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{children}</p>
  );
}

// Simple bar sparkline using divs
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getRevenue(),
      adminApi.getOrganizations(),
    ]).then(([statsRes, revRes, orgsRes]) => {
      setStats(statsRes.data.data);
      setRevenueData(revRes.data.data);
      setOrgs(orgsRes.data.data);
    }).catch(() => setError("Failed to load platform stats")).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 bg-slate-800 rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center text-slate-400 py-12">{error || "Failed to load stats"}</div>;

  const churnRate = stats.activeSubscriptions > 0
    ? ((stats.cancelledThisMonth / (stats.activeSubscriptions + stats.cancelledThisMonth)) * 100).toFixed(1)
    : "0.0";

  const topOrgs = [...revenueData].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
  const maxOrgRevenue = topOrgs[0]?.totalRevenue ?? 1;

  const recentOrgs = [...orgs]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time health of your HMS platform</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">{stats.totalOrgs} hospitals on platform</span>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div>
        <SectionLabel>Revenue</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Monthly Recurring Revenue" value={`₹${stats.mrr.toLocaleString()}`}
            sub={`ARR ₹${stats.arr.toLocaleString()}`} icon={TrendingUp} accent="bg-emerald-500" href="/admin/revenue" />
          <KpiCard label="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`}
            sub="Sales + invoice payments" icon={DollarSign} accent="bg-violet-500" href="/admin/revenue" />
          <KpiCard label="Avg Revenue / Org" value={`₹${stats.totalOrgs > 0 ? Math.round(stats.mrr / stats.totalOrgs).toLocaleString() : 0}`}
            sub="Per active organization" icon={BarChart3} accent="bg-amber-500" />
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <SectionLabel>Subscriptions</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Active Subscriptions" value={stats.activeSubscriptions}
            sub="Currently paid" icon={CreditCard} accent="bg-blue-500" href="/admin/subscriptions" />
          <KpiCard label="New This Month" value={stats.newSubsThisMonth}
            sub="New signups" icon={UserPlus} accent="bg-teal-500" href="/admin/subscriptions" />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/80 flex items-center justify-center shrink-0">
                <TrendingDown className="w-[18px] h-[18px] text-white" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                Number(churnRate) > 10 ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-400"
              }`}>
                {churnRate}% churn
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.cancelledThisMonth}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Cancelled This Month</p>
          </div>
        </div>
      </div>

      {/* Organizations & Users */}
      <div>
        <SectionLabel>Scale</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Organizations" value={stats.totalOrgs}
            sub={`${stats.activeOrgs} active`} icon={Building2} accent="bg-sky-500" href="/admin/organizations" />
          <KpiCard label="Total Users" value={stats.totalUsers}
            sub={`${stats.activeUsers} active · ${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}%`}
            icon={Users} accent="bg-indigo-500" href="/admin/users" />
          <KpiCard label="Total Patients" value={stats.totalPatients.toLocaleString()}
            sub={`+${stats.recentPatients} in 30d`} icon={Stethoscope} accent="bg-pink-500" />
          <KpiCard label="Today's Appointments" value={stats.todayAppointments}
            icon={Calendar} accent="bg-orange-500" />
        </div>
      </div>

      {/* Two column: top orgs + recent orgs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top orgs by revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Organizations by Revenue</h3>
            <Link href="/admin/revenue" className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {topOrgs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No revenue data yet</p>
          ) : (
            <div className="space-y-4">
              {topOrgs.map((org, i) => (
                <div key={org.orgId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-slate-600 w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-200 truncate">{org.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400 shrink-0 ml-2">
                      ₹{org.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <MiniBar value={org.totalRevenue} max={maxOrgRevenue} color="bg-emerald-500/50" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently added orgs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recently Added Organizations</h3>
            <Link href="/admin/organizations" className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrgs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No organizations yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrgs.map((org: any) => {
                const sub = org.subscriptions?.[0];
                return (
                  <Link key={org.id} href={`/admin/organizations/${org.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{org.name}</p>
                        <p className="text-[11px] text-slate-500">/{org.slug} · {org._count?.users ?? 0} users</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sub ? (
                        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          {sub.plan.name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-600">No plan</span>
                      )}
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${org.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <SectionLabel>Quick Actions</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Organization", href: "/admin/organizations", icon: Building2, color: "text-sky-400 bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40" },
            { label: "Assign Plan", href: "/admin/subscriptions", icon: CreditCard, color: "text-violet-400 bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40" },
            { label: "Feature Flags", href: "/admin/feature-flags", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40" },
            { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${a.color}`}>
              <a.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
