"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { DollarSign, Users, ShoppingCart } from "lucide-react";

interface RevenueItem {
  orgId: string;
  name: string;
  slug: string;
  totalRevenue: number;
  totalSales: number;
  totalPatients: number;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getRevenue().then((res) => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalPatients = data.reduce((sum, r) => sum + r.totalPatients, 0);
  const totalSales = data.reduce((sum, r) => sum + r.totalSales, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Overview</h1>
        <p className="text-gray-500 mt-1">Revenue breakdown across all organizations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-600 to-violet-600 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
            <span className="text-sm text-gray-500">Total Patients</span>
          </div>
          <div className="text-2xl font-bold">{totalPatients.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-600 to-amber-600 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-white" /></div>
            <span className="text-sm text-gray-500">Total Sales</span>
          </div>
          <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Organization</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Patients</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.orgId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{row.name}</div>
                    <div className="text-sm text-gray-500">/{row.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{row.totalPatients}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{row.totalSales}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">₹{row.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
