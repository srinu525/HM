"use client";

import { useEffect, useState } from "react";
import { patientPortalApi } from "@/lib/api";
import { TestTube, Loader2 } from "lucide-react";

interface LabResult {
  id: string;
  result: Record<string, unknown>;
  notes: string | null;
  status: string;
  createdAt: string;
  labTest: { id: string; name: string; price: number };
  doctor: { id: string; name: string };
}

export default function PatientLabResultsPage() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    patientPortalApi.getLabResults().then((res) => {
      setResults(res.data.data || []);
    }).catch((err) => {
      console.error(err);
      setError("Failed to load lab results");
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Reports</h1>
        <p className="text-gray-500 mt-1">View diagnostic test results</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading lab results...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-500">{error}</div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center">
          <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No lab results yet</p>
          <p className="text-sm text-gray-400 mt-1">Test results will appear here after your doctor orders them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{result.labTest.name}</p>
                  <p className="text-sm text-gray-500">
                    Ordered by Dr. {result.doctor.name} · {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  result.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  result.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {result.status}
                </span>
              </div>
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Parameter</th>
                      <th className="pb-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.result).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-50">
                        <td className="py-2 text-gray-700">{key}</td>
                        <td className="py-2 font-medium text-gray-900">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.notes && (
                  <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <span className="font-medium">Notes:</span> {result.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
