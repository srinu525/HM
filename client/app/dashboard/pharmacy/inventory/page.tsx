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
import { Pill, Search, Package, AlertTriangle, Plus } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [stockForm, setStockForm] = useState({ id: "", stock: "" });

  const fetchMedicines = async (q?: string) => {
    try {
      const res = await api.get("/pharmacy/medicines", { params: { search: q || undefined } });
      setMedicines(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMedicines();
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
      setAddDialogOpen(false);
      fetchMedicines(search);
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
      setSelectedMedicine(null);
      fetchMedicines(search);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const lowStockCount = medicines.filter((m) => m.stock < 10).length;
  const totalValue = medicines.reduce((sum, m) => sum + m.price * m.stock, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicine Inventory</h1>
          <p className="text-gray-600 mt-1">Manage medicine stock and catalog</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
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
                  onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={medicineForm.price}
                    onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    value={medicineForm.stock}
                    onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
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
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("success")
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
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
                <p className="text-xs text-gray-500">Total Medicines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Inventory Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                <p className="text-xs text-gray-500">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicines ({medicines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {medicines.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medicines found</p>
                <p className="text-sm text-gray-400 mt-1">Add medicines to get started</p>
              </div>
            ) : (
              medicines.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                      <Pill className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{med.price.toFixed(2)}
                        {med.description && <span className="ml-2">| {med.description}</span>}
                      </p>
                    </div>
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
                        setSelectedMedicine(med);
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

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Update Stock - {selectedMedicine?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Stock: {selectedMedicine?.stock}</Label>
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
