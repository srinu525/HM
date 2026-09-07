"use client";

import { useEffect, useState } from "react";
import { patientPortalApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Loader2 } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface Appointment {
  id: string;
  token: number;
  status: string;
  date: string;
  notes: string | null;
  consultationFee: number;
  doctor: { id: string; name: string };
  consultation: { id: string; diagnosis: string | null } | null;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      patientPortalApi.getAppointments(),
      patientPortalApi.getDoctors(),
    ]).then(([aptRes, docRes]) => {
      setAppointments(aptRes.data.data || []);
      setDoctors(docRes.data.data || []);
    }).catch((err) => {
      console.error(err);
      setError("Failed to load data");
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async () => {
    if (!selectedDoctor) return;
    setBooking(true);
    try {
      await patientPortalApi.bookAppointment({ doctorId: selectedDoctor, notes });
      setBookOpen(false);
      setSelectedDoctor("");
      setNotes("");
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await patientPortalApi.cancelAppointment(id);
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-700",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return `px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your doctor visits</p>
        </div>
        <Dialog open={bookOpen} onOpenChange={setBookOpen}>
          <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white" />}>
            <Plus className="w-4 h-4 mr-2" /> Book Appointment
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Book an Appointment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Doctor</Label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[80px]"
                />
              </div>
              <Button
                onClick={handleBook}
                disabled={!selectedDoctor || booking}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {booking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-200">{error}</div>
        )}
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
            <p className="text-sm text-gray-400 mt-1">Book your first appointment to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-700">#{apt.token}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dr. {apt.doctor.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{new Date(apt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>{new Date(apt.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      {apt.consultationFee > 0 && <span>₹{apt.consultationFee}</span>}
                    </div>
                    {apt.notes && <p className="text-sm text-gray-400 mt-1">{apt.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={statusBadge(apt.status)}>{apt.status.replace("_", " ")}</span>
                  {apt.status === "SCHEDULED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleCancel(apt.id)}
                      disabled={cancellingId === apt.id}
                    >
                      {cancellingId === apt.id ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                  {apt.consultation?.diagnosis && (
                    <span className="text-xs text-gray-400">Diagnosis: {apt.consultation.diagnosis}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
