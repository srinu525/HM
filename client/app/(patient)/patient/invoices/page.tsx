"use client";

import { useEffect, useState } from "react";
import { patientPortalApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Download, Loader2, CheckCircle } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

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
  items: InvoiceItem[];
  payments: Payment[];
}

export default function PatientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmPay, setConfirmPay] = useState<Invoice | null>(null);

  const fetchInvoices = () => {
    setLoading(true);
    setError("");
    patientPortalApi.getInvoices().then((res) => {
      setInvoices(res.data.data || []);
    }).catch((err) => {
      console.error(err);
      setError("Failed to load invoices");
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handlePay = async (id: string) => {
    setPayingId(id);
    setConfirmPay(null);
    try {
      await patientPortalApi.payInvoice(id);
      fetchInvoices();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await patientPortalApi.downloadInvoicePdf(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to download PDF");
    }
  };

  const pendingInvoices = invoices.filter((inv) => inv.status !== "PAID");
  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pay Bills</h1>
        <p className="text-gray-500 mt-1">View and pay your invoices</p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">{error}</div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices found</p>
          <p className="text-sm text-gray-400 mt-1">Your invoices will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingInvoices.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Pending Payments</h2>
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          {invoice.description && (
                            <p className="text-sm text-gray-500">{invoice.description}</p>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          {invoice.status}
                        </span>
                      </div>

                      {invoice.items.length > 0 && (
                        <div className="mb-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="pb-2 font-medium">Item</th>
                                <th className="pb-2 font-medium text-right">Qty</th>
                                <th className="pb-2 font-medium text-right">Rate</th>
                                <th className="pb-2 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoice.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50">
                                  <td className="py-2 text-gray-700">{item.description}</td>
                                  <td className="py-2 text-right text-gray-700">{item.quantity}</td>
                                  <td className="py-2 text-right text-gray-700">₹{item.unitPrice}</td>
                                  <td className="py-2 text-right font-medium">₹{item.total}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Amount: ₹{invoice.amount}
                            {invoice.tax > 0 && <span> + Tax: ₹{invoice.tax}</span>}
                          </p>
                          <p className="text-lg font-bold text-gray-900">Total: ₹{invoice.total}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(invoice.id)}
                          >
                            <Download className="h-4 w-4 mr-1" /> PDF
                          </Button>
                          {invoice.status !== "PAID" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => setConfirmPay(invoice)}
                              disabled={payingId === invoice.id}
                            >
                              {payingId === invoice.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              Pay ₹{invoice.total}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paidInvoices.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h2>
              <div className="space-y-3">
                {paidInvoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          Paid on {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">₹{invoice.total}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPdf(invoice.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!confirmPay} onOpenChange={(open) => { if (!open) setConfirmPay(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are about to pay <span className="font-semibold">₹{confirmPay?.total}</span> for invoice <span className="font-semibold">{confirmPay?.invoiceNumber}</span>.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmPay(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => confirmPay && handlePay(confirmPay.id)}
                disabled={!!payingId}
              >
                {payingId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Confirm Pay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
