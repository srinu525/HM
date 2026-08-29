"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface QueueItem {
  id: string;
  token: number;
  status: string;
  date: string;
  validUntil: string | null;
  consultationFee: number;
  patient: { id: string; patientId: string; name: string; phone: string | null; gender: string };
  doctor: { id: string; name: string };
}

export default function QueuePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isDoctor = user?.role === "DOCTOR";

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchAppointments = async () => {
    try {
      const url = isDoctor && user?.id
        ? `/appointments/queue/${user.id}`
        : "/appointments";
      const res = await api.get(url);
      setAppointments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = appointments.filter((a) => {
    const today = new Date().toDateString();
    return new Date(a.date).toDateString() === today;
  });

  const scheduled = todayAppointments.filter((a) => a.status === "SCHEDULED");
  const inProgress = todayAppointments.filter((a) => a.status === "IN_PROGRESS");
  const completed = todayAppointments.filter((a) => a.status === "COMPLETED");
  const cancelled = todayAppointments.filter((a) => a.status === "CANCELLED");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "COMPLETED": return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCHEDULED": return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS": return <AlertCircle className="h-4 w-4" />;
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isDoctor ? "My Queue" : "Queue View"}</h1>
          <p className="text-gray-600 mt-1">Real-time appointment queue</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{isDoctor ? "My Queue" : "Queue View"}</h1>
        <p className="text-gray-600 mt-1">Real-time appointment queue - auto-refreshes every 10 seconds</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                <p className="text-xs text-gray-500">Total Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{scheduled.length}</p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{inProgress.length}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completed.length}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Today&apos;s Queue
            </span>
            <Badge variant="secondary">{todayAppointments.length} appointments</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments today</p>
              <p className="text-sm text-gray-400 mt-1">New appointments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {todayAppointments.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-200 ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <p className="text-xl font-bold">#{item.token}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.patient.name}</p>
                        <span className="text-xs opacity-70">{item.patient.patientId}</span>
                      </div>
                      <p className="text-sm opacity-80">
                        Dr. {item.doctor.name}
                        {item.patient.phone && ` | ${item.patient.phone}`}
                      </p>
                      {item.consultationFee > 0 && (
                        <p className="text-xs opacity-70">Fee: ₹{item.consultationFee}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Badge variant="outline" className="border-current">
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
