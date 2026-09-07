"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Users, Calendar } from "lucide-react";

interface DailyStats {
  date: string;
  patients: number;
  appointments: number;
  revenue: number;
}

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  todayRevenue: number;
  weeklyStats: DailyStats[];
  monthlyStats: DailyStats[];
}

export function DashboardAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stats/analytics");
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                <p className="text-xs text-gray-500 mt-1">Registered patients</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled today</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Today's earnings</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Revenue Chart */}
      {stats.weeklyStats && stats.weeklyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => `₹${value}`}
                  stroke="#888"
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly Appointments & Patients */}
      {stats.monthlyStats && stats.monthlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Appointments & Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="appointments" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="patients" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span className="text-sm text-gray-600">Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">New Patients</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}