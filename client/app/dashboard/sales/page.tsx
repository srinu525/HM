"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, Pill, Download } from "lucide-react";
import { format } from "date-fns";
import { generateInvoice } from "@/lib/pdf-generator";

interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Sale {
  id: string;
  total: number;
  createdAt: string;
  patient: { id: string; patientId?: string; name: string; phone?: string };
  items: SaleItem[];
}

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (filters.startDate || filters.endDate) {
      loadSales();
    }
  }, [filters]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get("/stats/sales/history", { params });
      setSales(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (sale: Sale) => {
    const invoiceData = {
      id: sale.id,
      patientName: sale.patient.name,
      patientId: sale.patient.patientId,
      patientPhone: sale.patient.phone,
      items: sale.items,
      total: sale.total,
      createdAt: sale.createdAt,
    };
    generateInvoice(invoiceData);
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  const exportCSV = () => {
    const headers = ["Date", "Patient", "Patient ID", "Items", "Total"];
    const rows = sales.map(sale => [
      format(new Date(sale.createdAt), "yyyy-MM-dd HH:mm"),
      sale.patient.name,
      sale.patient.patientId || "",
      sale.items.map(i => `${i.medicineName} x${i.quantity}`).join("; "),
      sale.total,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sales-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600 mt-1">View and download invoices</p>
        </div>
        {sales.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{sales.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ startDate: "", endDate: "" })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {sales.length} {sales.length === 1 ? "sale" : "sales"} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sale.patient.name} {sale.patient.patientId && <span className="text-sm text-gray-400">{sale.patient.patientId}</span>}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 space-y-1">
                      <div className="flex flex-wrap gap-2">
                        {sale.items.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item.medicineName} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{sale.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadInvoice(sale)}
                  >
                    Invoice
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}