"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { DollarSign, ShoppingCart, Receipt, TrendingUp, Building2 } from "lucide-react";
import Link from "next/link";

interface RevenueItem {
  orgId: string; name: string; slug: string;
  salesRevenue: number; invoiceRevenue: number;
  totalRevenue: number; totalSales: number; totalPatients: number;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 2;
  return <div className="w-full bg-slate-800 rounded-full h-1"><div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"total" | "sales" | "invoice">("total");
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getRevenue().then((res) => { setData(res.data.data); setError(""); }).catch(() => setError("Failed to load revenue data")).finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.reduce((s, r) => s + r.totalRevenue, 0);
  const totalSalesRev = data.reduce((s, r) => s + r.salesRevenue, 0);
  const totalInvRev = data.reduce((s, r) => s + r.invoiceRevenue, 0);
  const totalPatients = data.reduce((s, r) => s + r.totalPatients, 0);

  const sorted = [...data].sort((a, b) => {
    if (sortBy === "sales") return b.salesRevenue - a.salesRevenue;
    if (sortBy === "invoice") return b.invoiceRevenue - a.invoiceRevenue;
    return b.totalRevenue - a.totalRevenue;
  });
  const maxRev = sorted[0]?.totalRevenue ?? 1;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-white">Revenue Overview</h1>
        <p className="text-sm text-slate-400 mt-0.5">Pharmacy sales + invoice payments across all organizations</p>
      </div>

      {error && <div className="px-4 py-2.5 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{error}</div>}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, sub: "Sales + Invoices", icon: DollarSign, color: "bg-emerald-500" },
          { label: "Pharmacy Sales", value: `₹${totalSalesRev.toLocaleString()}`, sub: `${data.reduce((s, r) => s + r.totalSales, 0)} transactions`, icon: ShoppingCart, color: "bg-blue-500" },
          { label: "Invoice Revenue", value: `₹${totalInvRev.toLocaleString()}`, sub: "Completed payments", icon: Receipt, color: "bg-violet-500" },
          { label: "Total Patients", value: totalPatients.toLocaleString(), sub: "Across all orgs", icon: TrendingUp, color: "bg-amber-500" },
        ].map((k) => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 ${k.color} rounded-lg flex items-center justify-center`}>
                <k.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-slate-400">{k.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{k.value}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Breakdown by Organization</h3>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
            {[["total", "Total"], ["sales", "Sales"], ["invoice", "Invoice"]].map(([val, lbl]) => (
              <button key={val} onClick={() => setSortBy(val as any)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${sortBy === val ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No revenue data yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {sorted.map((row, i) => (
              <div key={row.orgId} className="px-5 py-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-600 w-5 shrink-0">{i + 1}</span>
                    <Link href={`/admin/organizations/${row.orgId}`}
                      className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{row.name}</span>
                      <span className="text-[11px] text-slate-600 shrink-0">/{row.slug}</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
                      <span>Sales ₹{row.salesRevenue.toLocaleString()}</span>
                      <span>Invoices ₹{row.invoiceRevenue.toLocaleString()}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">₹{row.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <MiniBar value={row.totalRevenue} max={maxRev} color="bg-emerald-500/40" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
