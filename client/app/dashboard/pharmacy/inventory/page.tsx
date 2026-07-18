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
  AlertTriangle,
  AlertCircle,
  Clock,
  Package,
  Edit,
  Plus,
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  expiryDate: string | null;
  batchNumber: string | null;
  reorderLevel: number;
  isActive: boolean;
}

interface InventoryAlerts {
  lowStock: { id: string; name: string; stock: number; reorderLevel: number }[];
  expiringSoon: { id: string; name: string; expiryDate: string; stock: number }[];
  expired: { id: string; name: string; expiryDate: string; stock: number }[];
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", description: "", price: "", stock: "", reorderLevel: "", expiryDate: "", batchNumber: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [medsRes, alertsRes] = await Promise.all([
        api.get("/pharmacy/medicines"),
        api.get("/pharmacy/inventory/alerts"),
      ]);
      setMedicines(medsRes.data.data);
      setAlerts(alertsRes.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleEdit = (med: Medicine) => {
    setSelectedMedicine(med);
    setEditForm({
      name: med.name,
      description: med.description || "",
      price: String(med.price),
      stock: String(med.stock),
      reorderLevel: String(med.reorderLevel),
      expiryDate: med.expiryDate ? med.expiryDate.split("T")[0] : "",
      batchNumber: med.batchNumber || "",
    });
    setEditDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    try {
      await api.put(`/pharmacy/medicines/${selectedMedicine.id}`, {
        name: editForm.name,
        description: editForm.description || undefined,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        reorderLevel: Number(editForm.reorderLevel),
        expiryDate: editForm.expiryDate || undefined,
        batchNumber: editForm.batchNumber || undefined,
      });
      setEditDialogOpen(false);
      loadData();
    } catch (e) { console.error(e); }
  };

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const expiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const exp = new Date(expiryDate);
    const now = new Date();
    if (exp < now) return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    const thirtyDays = new Date(now); thirtyDays.setDate(thirtyDays.getDate() + 30);
    if (exp <= thirtyDays) return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
    return <Badge className="bg-green-100 text-green-700">Valid</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track stock levels, expiry dates, and reorder alerts</p>
      </div>

      {/* Alert Cards */}
      {alerts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{alerts.expired.length}</p>
                </div>
              </div>
              {alerts.expired.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {alerts.expired.map(m => (
                    <Badge key={m.id} variant="destructive" className="text-xs">{m.name}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon (30d)</p>
                  <p className="text-2xl font-bold text-yellow-600">{alerts.expiringSoon.length}</p>
                </div>
              </div>
              {alerts.expiringSoon.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {alerts.expiringSoon.slice(0, 3).map(m => (
                    <Badge key={m.id} className="bg-yellow-100 text-yellow-700 text-xs">{m.name}</Badge>
                  ))}
                  {alerts.expiringSoon.length > 3 && <Badge className="bg-gray-100 text-gray-700 text-xs">+{alerts.expiringSoon.length - 3} more</Badge>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{alerts.lowStock.length}</p>
                </div>
              </div>
              {alerts.lowStock.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {alerts.lowStock.slice(0, 3).map(m => (
                    <Badge key={m.id} className="bg-orange-100 text-orange-700 text-xs">{m.name} ({m.stock})</Badge>
                  ))}
                  {alerts.lowStock.length > 3 && <Badge className="bg-gray-100 text-gray-700 text-xs">+{alerts.lowStock.length - 3} more</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" /> All Medicines ({filtered.length})
            </span>
            <Input
              placeholder="Search medicines or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No medicines found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Batch</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                    <th className="pb-2 font-medium text-right">Reorder</th>
                    <th className="pb-2 font-medium">Expiry</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((med) => (
                    <tr key={med.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{med.name}</td>
                      <td className="py-3 text-gray-500">{med.batchNumber || "-"}</td>
                      <td className="py-3 text-right">₹{med.price}</td>
                      <td className={`py-3 text-right font-medium ${med.stock <= med.reorderLevel ? "text-orange-600" : "text-gray-900"}`}>
                        {med.stock}
                      </td>
                      <td className="py-3 text-right text-gray-500">{med.reorderLevel}</td>
                      <td className="py-3">
                        {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString("en-IN") : "-"}
                      </td>
                      <td className="py-3">{expiryStatus(med.expiryDate)}</td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(med)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogTrigger render={<button type="button" className="hidden" />}>
          <span />
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input type="number" value={editForm.reorderLevel} onChange={(e) => setEditForm({ ...editForm, reorderLevel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input value={editForm.batchNumber} onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
