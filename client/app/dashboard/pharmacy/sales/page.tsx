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
import { ShoppingCart, Plus, Receipt, TrendingUp, AlertTriangle } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  expiryDate: string | null;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  phone: string | null;
}

interface SaleItem {
  medicineId: string;
  quantity: number;
}

interface Sale {
  id: string;
  total: number;
  createdAt: string;
  patient: { id: string; patientId: string; name: string };
  prescription: { id: string; status: string } | null;
  items: { medicine: { name: string }; quantity: number; unitPrice: number; total: number }[];
}

export default function SalesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);

  const [billingForm, setBillingForm] = useState({ patientId: "" });
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ medicineId: "", quantity: 1 }]);
  const [medicineSearch, setMedicineSearch] = useState("");

  const expiringSoon = (med: Medicine | undefined) => {
    if (!med?.expiryDate) return false;
    const days = Math.ceil((new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 30;
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  function resetSaleForm() {
    setSaleItems([{ medicineId: "", quantity: 1 }]);
    setBillingForm({ patientId: "" });
    setMedicineSearch("");
  }

  useEffect(() => {
    async function load() {
      const [mRes, pRes, sRes] = await Promise.all([
        api.get("/pharmacy/medicines"),
        api.get("/patients"),
        api.get("/pharmacy/sales"),
      ]);
      setMedicines(mRes.data.data);
      setPatients(pRes.data.data);
      setSales(sRes.data.data);
    }
    load();
  }, []);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = saleItems.filter((item) => item.medicineId && item.quantity > 0);
    if (validItems.length === 0) {
      setMessage("Add at least one medicine to bill");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/pharmacy/sales", {
        patientId: billingForm.patientId,
        items: validItems,
      });
      const warnings = res.data.data?.expiryWarnings || [];
      setMessage(
        `Sale completed! Total: ₹${res.data.data.total}${
          warnings.length > 0 ? ` (Warning: ${warnings.length} medicine(s) expire within 30 days)` : ""
        }`
      );
      setBillingDialogOpen(false);
      resetSaleForm();
      // Refresh data
      const [mRes, sRes] = await Promise.all([
        api.get("/pharmacy/medicines"),
        api.get("/pharmacy/sales"),
      ]);
      setMedicines(mRes.data.data);
      setSales(sRes.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { medicineId: "", quantity: 1 }]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const updated = [...saleItems];
    updated[index] = { ...updated[index], [field]: value };
    setSaleItems(updated);
  };

  const totalAmount = saleItems.reduce((sum, item) => {
    const med = medicines.find((m) => m.id === item.medicineId);
    return sum + (med ? med.price * item.quantity : 0);
  }, 0);

  const todaySales = sales.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.createdAt).toDateString() === today;
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  const handleDownloadInvoice = (sale: Sale) => {
    const invoiceContent = `
      <html><head><title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        th { background: #f3f4f6; font-size: 13px; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
      </style></head><body>
      <div class="header">
        <div class="logo">HM System</div>
        <p>Hospital Management - Invoice</p>
      </div>
      <p><strong>Invoice #:</strong> ${sale.id.slice(0, 8)}</p>
      <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleDateString()}</p>
      <p><strong>Patient:</strong> ${sale.patient.name} (${sale.patient.patientId})</p>
      <table>
        <thead>
          <tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${sale.items.map((item) => `
            <tr>
              <td>${item.medicine.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice.toFixed(2)}</td>
              <td>₹${item.total.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="total">Total: ₹${sale.total.toFixed(2)}</div>
      <div class="footer">Thank you for your visit!</div>
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(invoiceContent);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage sales and generate invoices</p>
        </div>
        <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Sale / Billing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSale} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select
                  value={billingForm.patientId}
                  onValueChange={(v) => v && setBillingForm({ patientId: v })}
                  items={Object.fromEntries(patients.map(p => [p.id, `${p.name} (${p.patientId})${p.phone ? ` - ${p.phone}` : ""}`]))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.patientId}) {p.phone ? `- ${p.phone}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Medicines</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
                    + Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Search medicines..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="mb-1"
                  />
                  {saleItems.map((item, index) => {
                    const med = medicines.find((m) => m.id === item.medicineId);
                    const insufficient = med ? item.quantity > med.stock : false;
                    const expSoon = expiringSoon(med);
                    return (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Medicine</Label>
                          <select
                            className="w-full border rounded px-2 py-1.5 text-sm"
                            value={item.medicineId}
                            onChange={(e) => updateSaleItem(index, "medicineId", e.target.value)}
                          >
                            <option value="">Select...</option>
                            {filteredMedicines.map((m) => (
                              <option key={m.id} value={m.id} disabled={m.stock === 0}>
                                {m.name} - ₹{m.price} (Stock: {m.stock})
                                {m.expiryDate ? ` - Exp ${new Date(m.expiryDate).toLocaleDateString()}` : ""}
                              </option>
                            ))}
                          </select>
                          {insufficient && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Insufficient stock (only {med?.stock} available)
                            </p>
                          )}
                          {expSoon && (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Expires{" "}
                              {med?.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : ""}{" "}
                              — within 30 days
                            </p>
                          )}
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateSaleItem(index, "quantity", parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        {saleItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => removeSaleItem(index)}
                          >
                            x
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-3 text-right">
                <p className="text-lg font-bold">Total: ₹{totalAmount.toFixed(2)}</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Complete Sale"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("success") || message.includes("completed")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
                <p className="text-xs text-gray-500">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">₹{todayRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Today&apos;s Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todaySales.length}</p>
                <p className="text-xs text-gray-500">Today&apos;s Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Sales History ({sales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No sales yet</p>
                <p className="text-sm text-gray-400 mt-1">Create a sale to get started</p>
              </div>
            ) : (
              sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{sale.patient.name}</p>
                      <span className="text-xs text-gray-400">{sale.patient.patientId}</span>
                      {sale.prescription && (
                        <Badge className="bg-blue-100 text-blue-700">From Prescription</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {sale.items.map((item) => item.medicine.name).join(", ")}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(sale.createdAt).toLocaleDateString()} at{" "}
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-green-600">₹{sale.total.toFixed(2)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadInvoice(sale)}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
