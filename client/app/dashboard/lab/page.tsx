"use client";

import { useState, useEffect } from "react";
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
import { TestTube, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface LabTest {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  _count?: { results: number };
}

interface LabResult {
  id: string;
  result: Record<string, unknown>;
  notes: string | null;
  status: string;
  createdAt: string;
  labTest: { id: string; name: string; price: number };
  patient: { id: string; patientId: string; name: string; phone: string | null };
  doctor: { id: string; name: string };
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
}

export default function LabPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [testForm, setTestForm] = useState({ name: "", description: "", price: "" });
  const [resultForm, setResultForm] = useState({ labTestId: "", patientId: "", notes: "", status: "COMPLETED" });
  const [resultFields, setResultFields] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  useEffect(() => {
    async function load() {
      try {
        const [testsRes, resultsRes, patientsRes] = await Promise.all([
          api.get("/lab/tests"),
          api.get("/lab/results"),
          api.get("/patients", { params: { limit: 100 } }),
        ]);
        setTests(testsRes.data.data);
        setResults(resultsRes.data.data);
        setPatients(patientsRes.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/lab/tests", {
        name: testForm.name,
        description: testForm.description || undefined,
        price: testForm.price ? Number(testForm.price) : 0,
      });
      setMessage("Lab test created!");
      setTestDialogOpen(false);
      setTestForm({ name: "", description: "", price: "" });
      const res = await api.get("/lab/tests");
      setTests(res.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to create test");
    }
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultObj: Record<string, unknown> = {};
      resultFields.forEach(f => { if (f.key) resultObj[f.key] = f.value; });
      await api.post("/lab/results", {
        labTestId: resultForm.labTestId,
        patientId: resultForm.patientId,
        result: resultObj,
        notes: resultForm.notes || undefined,
        status: resultForm.status,
      });
      setMessage("Lab result recorded!");
      setResultDialogOpen(false);
      setResultForm({ labTestId: "", patientId: "", notes: "", status: "COMPLETED" });
      setResultFields([{ key: "", value: "" }]);
      const res = await api.get("/lab/results");
      setResults(res.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to record result");
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Module</h1>
          <p className="text-gray-600 mt-1">Manage lab tests and results</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes("success") || message.includes("created") || message.includes("recorded")
          ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>
      )}

      <div className="flex gap-2">
        <Button variant={activeTab === "tests" ? "default" : "outline"} onClick={() => setActiveTab("tests")}>
          <TestTube className="h-4 w-4 mr-2" /> Lab Tests
        </Button>
        <Button variant={activeTab === "results" ? "default" : "outline"} onClick={() => setActiveTab("results")}>
          Results ({results.length})
        </Button>
      </div>

      {activeTab === "tests" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Lab Tests ({tests.length})
              </span>
              <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogTrigger render={<Button size="sm" />}>
                  <Plus className="h-4 w-4 mr-1" /> Add Test
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>New Lab Test</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTest} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={testForm.name} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input type="number" value={testForm.price} onChange={(e) => setTestForm({ ...testForm, price: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full">Create Test</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    {test.description && <p className="text-sm text-gray-500">{test.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">₹{test.price}</span>
                    <Badge className="bg-gray-100 text-gray-700">{test._count?.results || 0} results</Badge>
                  </div>
                </div>
              ))}
              {tests.length === 0 && <p className="text-center text-gray-500 py-8">No lab tests configured</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "results" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lab Results</span>
              <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                <DialogTrigger render={<Button size="sm" />}>
                  <Plus className="h-4 w-4 mr-1" /> Record Result
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Record Lab Result</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateResult} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Lab Test *</Label>
                      <Select value={resultForm.labTestId} onValueChange={(v) => setResultForm({ ...resultForm, labTestId: v ?? "" })}>
                        <SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
                        <SelectContent>
                          {tests.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Patient *</Label>
                      <Select value={resultForm.patientId} onValueChange={(v) => setResultForm({ ...resultForm, patientId: v ?? "" })}>
                        <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                        <SelectContent>
                          {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.patientId})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={resultForm.status} onValueChange={(v) => setResultForm({ ...resultForm, status: v ?? "COMPLETED" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Result Fields</Label>
                      {resultFields.map((field, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input placeholder="Parameter" value={field.key} onChange={(e) => {
                            const updated = [...resultFields];
                            updated[idx].key = e.target.value;
                            setResultFields(updated);
                          }} />
                          <Input placeholder="Value" value={field.value} onChange={(e) => {
                            const updated = [...resultFields];
                            updated[idx].value = e.target.value;
                            setResultFields(updated);
                          }} />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setResultFields([...resultFields, { key: "", value: "" }])}>
                        + Add Field
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input value={resultForm.notes} onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full">Save Result</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.labTest.name} — {r.patient.name}</p>
                      <p className="text-sm text-gray-500">Dr. {r.doctor.name} &middot; {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcon(r.status)}
                      <Badge className={r.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(r.result).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded px-2 py-1 text-sm">
                        <span className="text-gray-500">{k}: </span>
                        <span className="font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                  {r.notes && <p className="text-sm text-gray-500 mt-2">{r.notes}</p>}
                </div>
              ))}
              {results.length === 0 && <p className="text-center text-gray-500 py-8">No lab results yet</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
