"use client";

import { useState, useEffect } from "react";
import { invoiceApi } from "@/lib/api";
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
import { Plus, CreditCard, FileText, Clock, CheckCircle, Download, Trash2, IndianRupee } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  description: string | null;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
  payments: { id: string; amount: number; method: string; createdAt: string }[];
  patient: { id: string; patientId: string; name: string } | null;
}

interface InvoiceStats {
  totalInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  last30DaysRevenue: number;
}

interface Patient { id: string; patientId: string; name: string }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [invoiceForm, setInvoiceForm] = useState({
    description: "", patientId: "", tax: "", dueDate: "",
    items: [{ description: "", quantity: "1", unitPrice: "" }],
  });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "CASH", reference: "", notes: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [invRes, statsRes, patRes] = await Promise.all([
        invoiceApi.getAll(),
        invoiceApi.getStats(),
        import("@/lib/api").then(m => m.api.get("/patients", { params: { limit: 100 } })),
      ]);
      setInvoices(invRes.data.data);
      setStats(statsRes.data.data);
      setPatients(patRes.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoiceApi.create({
        description: invoiceForm.description || undefined,
        patientId: invoiceForm.patientId || undefined,
        tax: invoiceForm.tax ? Number(invoiceForm.tax) : undefined,
        dueDate: invoiceForm.dueDate || undefined,
        items: invoiceForm.items.filter(i => i.description).map(i => ({
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
        })),
      });
      setMessage("Invoice created!");
      setCreateDialogOpen(false);
      setInvoiceForm({ description: "", patientId: "", tax: "", dueDate: "", items: [{ description: "", quantity: "1", unitPrice: "" }] });
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to create invoice");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await invoiceApi.recordPayment({
        invoiceId: selectedInvoice.id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      });
      setMessage("Payment recorded!");
      setPaymentDialogOpen(false);
      setPaymentForm({ amount: "", method: "CASH", reference: "", notes: "" });
      setSelectedInvoice(null);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to record payment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await invoiceApi.delete(id);
      setMessage("Invoice deleted");
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const res = await invoiceApi.downloadPdf(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const filtered = statusFilter ? invoices.filter(i => i.status === statusFilter) : invoices;

  const statusColor = (status: string) => {
    switch (status) {
      case "PAID": return "default";
      case "SENT": return "secondary";
      case "DRAFT": return "outline";
      case "CANCELLED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices & Payments</h1>
          <p className="text-gray-600 mt-1">Manage invoices, record payments, and track revenue</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes("created") || message.includes("recorded") || message.includes("deleted")
          ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600" /></div>
                <div><p className="text-sm text-gray-600">Total Invoices</p><p className="text-2xl font-bold">{stats.totalInvoices}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div>
                <div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold">{stats.pendingInvoices}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><IndianRupee className="h-5 w-5 text-green-600" /></div>
                <div><p className="text-sm text-gray-600">Total Revenue</p><p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(0)}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><CreditCard className="h-5 w-5 text-purple-600" /></div>
                <div><p className="text-sm text-gray-600">Last 30 Days</p><p className="text-2xl font-bold">₹{stats.last30DaysRevenue.toFixed(0)}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Invoices ({filtered.length})</span>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="h-4 w-4 mr-1" /> New Invoice
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Patient (optional)</Label>
                    <Select value={invoiceForm.patientId} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, patientId: v ?? "" })}>
                      <SelectTrigger><SelectValue placeholder="Walk-in patient" /></SelectTrigger>
                      <SelectContent>
                        {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.patientId})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} placeholder="Invoice for..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tax (₹)</Label>
                      <Input type="number" value={invoiceForm.tax} onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Items</Label>
                    {invoiceForm.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2">
                        <Input placeholder="Description" value={item.description} onChange={(e) => {
                          const items = [...invoiceForm.items]; items[idx].description = e.target.value; setInvoiceForm({ ...invoiceForm, items });
                        }} />
                        <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => {
                          const items = [...invoiceForm.items]; items[idx].quantity = e.target.value; setInvoiceForm({ ...invoiceForm, items });
                        }} />
                        <Input type="number" placeholder="Unit price" value={item.unitPrice} onChange={(e) => {
                          const items = [...invoiceForm.items]; items[idx].unitPrice = e.target.value; setInvoiceForm({ ...invoiceForm, items });
                        }} />
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setInvoiceForm({
                      ...invoiceForm, items: [...invoiceForm.items, { description: "", quantity: "1", unitPrice: "" }],
                    })}>+ Add Item</Button>
                  </div>
                  <Button type="submit" className="w-full">Create Invoice</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-gray-500 py-8">Loading...</p> : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No invoices found</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filtered.map((inv) => (
                <div key={inv.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-mono text-sm font-medium">{inv.invoiceNumber}</p>
                        <Badge variant={statusColor(inv.status)}>{inv.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {inv.patient ? `${inv.patient.name}` : "Walk-in"} &middot; {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString("en-IN")}`}
                      </p>
                      {inv.description && <p className="text-sm text-gray-600 mt-1">{inv.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {inv.items.map((item) => (
                          <Badge key={item.id} variant="secondary" className="text-xs">{item.description} × {item.quantity}</Badge>
                        ))}
                      </div>
                      {inv.payments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inv.payments.map((p) => (
                            <Badge key={p.id} className="bg-green-100 text-green-700 text-xs">₹{p.amount} ({p.method})</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-bold">₹{inv.total.toFixed(2)}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(inv.id)}><Download className="h-4 w-4" /></Button>
                        {inv.status !== "PAID" && (
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(inv); setPaymentDialogOpen(true); }}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        {inv.status !== "PAID" && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogTrigger render={<div />}>
          <span />
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment — {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="text-sm text-gray-600 mb-4">
              Total: ₹{selectedInvoice.total.toFixed(2)} &middot; Paid: ₹{selectedInvoice.payments.reduce((s, p) => s + p.amount, 0).toFixed(2)} &middot; Remaining: ₹{(selectedInvoice.total - selectedInvoice.payments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}
            </div>
          )}
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v ?? "CASH" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="Transaction ID..." />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Record Payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
