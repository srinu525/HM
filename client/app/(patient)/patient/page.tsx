"use client";

import { useEffect, useState } from "react";
import { patientPortalApi } from "@/lib/api";
import { Calendar, Pill, TestTube, CreditCard, UserRound, ArrowRight } from "lucide-react";
import Link from "next/link";

function getStoredPatient() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface Appointment {
  id: string;
  token: number;
  status: string;
  date: string;
  notes: string | null;
  doctor: { id: string; name: string };
  consultation: { id: string; diagnosis: string | null } | null;
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPatient(getStoredPatient());
    patientPortalApi.getAppointments().then((res) => {
      setAppointments(res.data.data || []);
    }).catch((err) => {
      console.error(err);
      setError("Failed to load appointments");
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Upcoming Appointments", value: appointments.filter(a => a.status === "SCHEDULED").length, icon: Calendar, color: "emerald" },
    { label: "Completed Visits", value: appointments.filter(a => a.status === "COMPLETED").length, icon: UserRound, color: "blue" },
  ];

  const quickActions = [
    { href: "/patient/appointments", label: "Book Appointment", icon: Calendar, desc: "Schedule a visit with a doctor" },
    { href: "/patient/prescriptions", label: "View Prescriptions", icon: Pill, desc: "Check your current medications" },
    { href: "/patient/lab-results", label: "Lab Reports", icon: TestTube, desc: "Review test results" },
    { href: "/patient/invoices", label: "Pay Bills", icon: CreditCard, desc: "View and pay outstanding invoices" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {patient?.name?.split(" ")[0] || "Patient"}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your health summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-100 w-fit mb-4 group-hover:bg-emerald-200 transition-colors">
                <action.icon className="h-5 w-5 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
          <Link href="/patient/appointments" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No appointments yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                      #{apt.token}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dr. {apt.doctor.name}</p>
                      <p className="text-sm text-gray-500">{new Date(apt.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    apt.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                    apt.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {apt.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
