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
import { Pill } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
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

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [stockForm, setStockForm] = useState({ id: "", stock: "" });

  const [billingForm, setBillingForm] = useState({ patientId: "" });
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ medicineId: "", quantity: 1 }]);

  const fetchMedicines = async (q?: string) => {
    try {
      const res = await api.get("/pharmacy/medicines", { params: { search: q || undefined } });
      setMedicines(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    async function load() {
      const [mRes, pRes] = await Promise.all([
        api.get("/pharmacy/medicines"),
        api.get("/patients"),
      ]);
      setMedicines(mRes.data);
      setPatients(pRes.data);
    }
    load();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchMedicines(value);
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/pharmacy/medicines", {
        name: medicineForm.name,
        description: medicineForm.description || undefined,
        price: parseFloat(medicineForm.price),
        stock: parseInt(medicineForm.stock),
      });
      setMessage("Medicine added successfully!");
      setMedicineForm({ name: "", description: "", price: "", stock: "" });
      setAddMedicineOpen(false);
      fetchMedicines();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.put(`/pharmacy/medicines/${stockForm.id}/stock`, {
        stock: parseInt(stockForm.stock),
      });
      setMessage("Stock updated successfully!");
      setStockDialogOpen(false);
      fetchMedicines();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

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
      setMessage(`Sale completed! Total: ₹${res.data.total}`);
      setBillingDialogOpen(false);
      setSaleItems([{ medicineId: "", quantity: 1 }]);
      setBillingForm({ patientId: "" });
      fetchMedicines();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy</h1>
          <p className="text-gray-600 mt-1">Medicine management & billing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addMedicineOpen} onOpenChange={setAddMedicineOpen}>
            <DialogTrigger render={<Button />}>
              + Add Medicine
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMedicine} className="space-y-4">
                <div className="space-y-2">
                  <Label>Medicine Name *</Label>
                  <Input
                    value={medicineForm.name}
                    onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={medicineForm.description}
                    onChange={(e) =>
                      setMedicineForm({ ...medicineForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={medicineForm.price}
                      onChange={(e) =>
                        setMedicineForm({ ...medicineForm, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      value={medicineForm.stock}
                      onChange={(e) =>
                        setMedicineForm({ ...medicineForm, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Medicine"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
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
                    {saleItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Medicine</Label>
                          <select
                            className="w-full border rounded px-2 py-1.5 text-sm"
                            value={item.medicineId}
                            onChange={(e) => updateSaleItem(index, "medicineId", e.target.value)}
                          >
                            <option value="">Select...</option>
                            {medicines.map((m) => (
                              <option key={m.id} value={m.id} disabled={m.stock === 0}>
                                {m.name} - ₹{m.price} (Stock: {m.stock})
                              </option>
                            ))}
                          </select>
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
                    ))}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicines Inventory ({medicines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-125 overflow-y-auto">
            {medicines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No medicines found</p>
                <p className="text-sm text-gray-400 mt-1">Add medicines to get started</p>
              </div>
            ) : (
              medicines.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{med.price.toFixed(2)}
                      {med.description && <span className="ml-2">| {med.description}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={med.stock < 10 ? "destructive" : "secondary"}
                      className="px-3 py-1"
                    >
                      Stock: {med.stock}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setStockForm({ id: med.id, stock: med.stock.toString() });
                        setStockDialogOpen(true);
                      }}
                    >
                      Update Stock
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label>New Stock Quantity *</Label>
              <Input
                type="number"
                value={stockForm.stock}
                onChange={(e) => setStockForm({ ...stockForm, stock: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Stock"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
