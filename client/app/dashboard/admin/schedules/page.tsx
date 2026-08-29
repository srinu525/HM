"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle, XCircle, Stethoscope } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface ScheduleEntry {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DoctorSchedules {
  doctor: Doctor;
  schedules: ScheduleEntry[];
}

interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const DEFAULT_SCHEDULE: ScheduleEntry[] = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isAvailable: false },
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isAvailable: false },
];

function mergeSchedules(apiSchedules: ScheduleEntry[]): ScheduleEntry[] {
  const map = new Map<number, ScheduleEntry>();
  for (const s of apiSchedules) map.set(s.dayOfWeek, s);
  return DEFAULT_SCHEDULE.map((d) => map.get(d.dayOfWeek) || { ...d });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function SchedulesPage() {
  const [activeTab, setActiveTab] = useState<"schedules" | "leaves">("schedules");

  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedules[]>([]);
  const [editedSchedules, setEditedSchedules] = useState<Record<string, ScheduleEntry[]>>({});
  const [savingDoctor, setSavingDoctor] = useState<string | null>(null);
  const [scheduleMsg, setScheduleMsg] = useState("");

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ doctorId: "", startDate: "", endDate: "", reason: "" });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveMsg, setLeaveMsg] = useState("");

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await api.get("/scheduling/doctors");
      const data = (res.data.data ?? res.data) as DoctorSchedules[];
      setDoctorSchedules(data);
      const edits: Record<string, ScheduleEntry[]> = {};
      for (const ds of data) edits[ds.doctor.id] = mergeSchedules(ds.schedules);
      setEditedSchedules(edits);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get("/scheduling/leaves");
      setLeaveRequests((res.data.data ?? res.data) as LeaveRequest[]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchAllDoctors = useCallback(async () => {
    try {
      const res = await api.get("/users/doctors");
      const data = (res.data.data ?? res.data) as Doctor[];
      setAllDoctors(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchLeaves();
    fetchAllDoctors();
  }, [fetchDoctors, fetchLeaves, fetchAllDoctors]);

  const handleScheduleChange = (doctorId: string, dayOfWeek: number, field: keyof ScheduleEntry, value: string | boolean) => {
    setEditedSchedules((prev) => ({
      ...prev,
      [doctorId]: (prev[doctorId] || []).map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      ),
    }));
  };

  const saveSchedule = async (doctorId: string) => {
    setSavingDoctor(doctorId);
    setScheduleMsg("");
    try {
      const schedules = (editedSchedules[doctorId] || []).map(({ dayOfWeek, startTime, endTime, isAvailable }) => ({
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
      }));
      await api.put(`/scheduling/schedule/${doctorId}`, { schedules });
      setScheduleMsg("Schedule saved successfully!");
      fetchDoctors();
      setTimeout(() => setScheduleMsg(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setScheduleMsg(error.response?.data?.message || "Failed to save schedule");
    } finally {
      setSavingDoctor(null);
    }
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setLeaveMsg("");
    try {
      await api.post("/scheduling/leaves", {
        userId: leaveForm.doctorId,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
      });
      setLeaveMsg("Leave request submitted!");
      setLeaveForm({ doctorId: "", startDate: "", endDate: "", reason: "" });
      setLeaveDialogOpen(false);
      fetchLeaves();
      setTimeout(() => setLeaveMsg(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setLeaveMsg(error.response?.data?.message || "Failed to submit leave");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const updateLeaveStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.put(`/scheduling/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Schedules</h1>
          <p className="text-gray-600 mt-1">Manage weekly schedules and leave requests</p>
        </div>
        {activeTab === "leaves" && (
          <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
            <DialogTrigger render={<Button />}>
              + Request Leave
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={submitLeave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select
                    value={leaveForm.doctorId}
                    onValueChange={(v) => v && setLeaveForm({ ...leaveForm, doctorId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {allDoctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <textarea
                    className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[80px] resize-none"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Reason for leave..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submittingLeave}>
                  {submittingLeave ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {scheduleMsg && (
        <div className={`p-3 rounded-md text-sm ${scheduleMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {scheduleMsg}
        </div>
      )}
      {leaveMsg && (
        <div className={`p-3 rounded-md text-sm ${leaveMsg.includes("success") || leaveMsg.includes("submitted") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {leaveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "schedules"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("schedules")}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Weekly Schedules
          </span>
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "leaves"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("leaves")}
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Leave Requests
            {leaveRequests.filter((l) => l.status === "PENDING").length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {leaveRequests.filter((l) => l.status === "PENDING").length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          {doctorSchedules.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                No doctors found.
              </CardContent>
            </Card>
          )}
          {doctorSchedules.map((ds) => {
            const schedules = editedSchedules[ds.doctor.id] || DEFAULT_SCHEDULE;
            const isSaving = savingDoctor === ds.doctor.id;
            return (
              <Card key={ds.doctor.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {ds.doctor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-semibold">{ds.doctor.name}</p>
                        <p className="text-sm text-gray-500 font-normal">{ds.doctor.email}</p>
                      </div>
                    </CardTitle>
                    <Button
                      size="sm"
                      disabled={isSaving}
                      onClick={() => saveSchedule(ds.doctor.id)}
                    >
                      {isSaving ? "Saving..." : "Save Schedule"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-2.5 px-4 font-medium text-gray-600">Day</th>
                          <th className="text-left py-2.5 px-4 font-medium text-gray-600">Start Time</th>
                          <th className="text-left py-2.5 px-4 font-medium text-gray-600">End Time</th>
                          <th className="text-left py-2.5 px-4 font-medium text-gray-600">Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day) => {
                          const entry = schedules.find((s) => s.dayOfWeek === day.value);
                          if (!entry) return null;
                          return (
                            <tr
                              key={day.value}
                              className={`border-b border-gray-100 last:border-0 ${
                                entry.isAvailable ? "" : "bg-gray-50/50"
                              }`}
                            >
                              <td className="py-2.5 px-4 font-medium text-gray-900">{day.label}</td>
                              <td className="py-2.5 px-4">
                                <Input
                                  type="time"
                                  value={entry.startTime}
                                  onChange={(e) =>
                                    handleScheduleChange(ds.doctor.id, day.value, "startTime", e.target.value)
                                  }
                                  disabled={!entry.isAvailable}
                                  className="w-32 h-8 text-sm"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <Input
                                  type="time"
                                  value={entry.endTime}
                                  onChange={(e) =>
                                    handleScheduleChange(ds.doctor.id, day.value, "endTime", e.target.value)
                                  }
                                  disabled={!entry.isAvailable}
                                  className="w-32 h-8 text-sm"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={entry.isAvailable}
                                    onChange={(e) =>
                                      handleScheduleChange(ds.doctor.id, day.value, "isAvailable", e.target.checked)
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === "leaves" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Leave Requests ({leaveRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                No leave requests found.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">From</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((lr) => (
                      <tr key={lr.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{lr.user?.name || lr.userId}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(lr.startDate)}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(lr.endDate)}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate" title={lr.reason}>
                          {lr.reason}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${statusStyles[lr.status] || ""} px-2.5 py-0.5`}>
                            {lr.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {lr.status === "PENDING" && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateLeaveStatus(lr.id, "APPROVED")}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateLeaveStatus(lr.id, "REJECTED")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
