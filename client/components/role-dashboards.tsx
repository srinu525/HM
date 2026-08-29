"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Clock,
  AlertTriangle,
  ShoppingCart,
  FileText,
  Activity,
  TrendingUp,
  Building2,
} from "lucide-react";

interface QueueItem {
  id: string;
  token: number;
  status: string;
  patient: { name: string; phone: string | null };
}

interface LowStockMedicine {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface TodaySale {
  id: string;
  totalAmount: number;
  createdAt: string;
  patient: { name: string };
}

interface DoctorStats {
  queue: QueueItem[];
  todayCompleted: number;
}

interface PharmacistStats {
  lowStock: LowStockMedicine[];
  todaySales: TodaySale[];
  todayRevenue: number;
}

interface ReceptionistStats {
  queue: QueueItem[];
  todayAppointments: number;
}

export function DoctorDashboard() {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const queueRes = await api.get(`/appointments/queue/${user?.id}`);
        const completedRes = await api.get("/consultations/completed-today");
        setStats({
          queue: queueRes.data.data,
          todayCompleted: completedRes.data.data?.length || 0,
        });
      } catch (e) { console.error(e); }
    }
    if (user) load();
  }, [user]);

  if (!stats) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <Card key={i}><CardContent className="p-6 h-24 bg-gray-100 rounded" /></Card>)}</div>;

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Queue Waiting</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.queue.filter(q => q.status === "SCHEDULED").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Patients in queue</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayCompleted}</p>
                <p className="text-xs text-gray-500 mt-1">Consultations done</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.queue.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No patients in queue</p>
          ) : (
            <div className="space-y-2">
              {stats.queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-blue-600">#{item.token}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.patient.name}</p>
                      {item.patient.phone && <p className="text-sm text-gray-500">{item.patient.phone}</p>}
                    </div>
                  </div>
                  <Badge className={statusColors[item.status] || ""}>{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/dashboard/consultations">
              <Button variant="outline" className="w-full">Open Consultation View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PharmacistDashboard() {
  const [stats, setStats] = useState<PharmacistStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [medsRes, salesRes] = await Promise.all([
          api.get("/pharmacy/medicines"),
          api.get("/pharmacy/sales"),
        ]);
        const medicines = medsRes.data.data || [];
        const sales = salesRes.data.data || [];
        const today = new Date().toISOString().split("T")[0];
        const todaySales = sales.filter((s: TodaySale) => s.createdAt.startsWith(today));

        setStats({
          lowStock: medicines.filter((m: LowStockMedicine) => m.stock < 10).slice(0, 5),
          todaySales: todaySales.slice(0, 5),
          todayRevenue: todaySales.reduce((sum: number, s: TodaySale) => sum + s.totalAmount, 0),
        });
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!stats) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <Card key={i}><CardContent className="p-6 h-24 bg-gray-100 rounded" /></Card>)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStock.length}</p>
                <p className="text-xs text-gray-500 mt-1">Need restocking</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Sales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todaySales.length}</p>
                <p className="text-xs text-gray-500 mt-1">Transactions</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Today&apos;s earnings</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStock.map((med) => (
                <div key={med.id} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Pill className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-500">₹{med.price}</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700">{med.stock} left</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/pharmacy/inventory">
                <Button variant="outline" className="w-full">Manage Inventory</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ReceptionistDashboard() {
  const [stats, setStats] = useState<ReceptionistStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const apptsRes = await api.get("/appointments");
        const appts = apptsRes.data.data || [];
        setStats({
          queue: appts.filter((a: QueueItem) => ["SCHEDULED", "IN_PROGRESS"].includes(a.status)).slice(0, 10),
          todayAppointments: appts.length,
        });
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!stats) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <Card key={i}><CardContent className="p-6 h-24 bg-gray-100 rounded" /></Card>)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.queue.length}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting consultation</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/patients">
          <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Register Patient</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/appointments">
          <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-cyan-600" />
              <span className="font-medium">New Appointment</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/queue">
          <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">View Queue</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

interface SystemStats {
  totalOrgs: number;
  activeOrgs: number;
  totalUsers: number;
  activeUsers: number;
  totalPatients: number;
  todayAppointments: number;
  todayRevenue: number;
  recentPatients: number;
  totalMedicines: number;
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/stats/system");
        setStats(res.data.data);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!stats) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="p-6 h-24 bg-gray-100 rounded" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrgs}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.activeOrgs} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.activeUsers} active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                <p className="text-xs text-gray-500 mt-1">+{stats.recentPatients} this month</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.todayAppointments} appointments today</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medicines</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMedicines}</p>
                <p className="text-xs text-gray-500 mt-1">Across all organizations</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">System-wide</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/organizations">
          <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Manage Organizations</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/billing/subscriptions">
          <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Pill className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Plans & Billing</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/users">
          <Card className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-medium">Manage Users</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
