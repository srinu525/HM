"use client";

import { useEffect, useState } from "react";
import { patientPortalApi } from "@/lib/api";
import { Pill, Loader2 } from "lucide-react";

interface PrescriptionItem {
  id: string;
  dosage: string;
  duration: string;
  instructions: string | null;
  quantity: number;
  medicine: { id: string; name: string; price: number };
}

interface Prescription {
  id: string;
  notes: string | null;
  createdAt: string;
  items: PrescriptionItem[];
  consultation: {
    doctor: { id: string; name: string };
    appointment: { token: number; date: string };
  };
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientPortalApi.getPrescriptions().then((res) => {
      setPrescriptions(res.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500 mt-1">View your current and past medications</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="p-12 text-center">
          <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No prescriptions yet</p>
          <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here after your consultations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Dr. {prescription.consultation.doctor.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      {" "}· Token #{prescription.consultation.appointment.token}
                    </p>
                  </div>
                </div>
                {prescription.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">{prescription.notes}</p>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {prescription.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.medicine.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.dosage} · {item.duration} · Qty: {item.quantity}
                        </p>
                        {item.instructions && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.instructions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
