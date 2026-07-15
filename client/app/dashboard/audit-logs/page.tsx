"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userId: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 30;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit };
        if (entityFilter && entityFilter !== "all") params.entity = entityFilter;
        if (actionFilter && actionFilter !== "all") params.action = actionFilter;
        const res = await api.get("/audit-logs", { params });
        setLogs(res.data.data.logs);
        setTotal(res.data.data.total);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [page, entityFilter, actionFilter]);

  useEffect(() => { setPage(1); }, [entityFilter, actionFilter]);

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Track all system activity</p>
      </div>

      <div className="flex gap-3">
        <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="Patient">Patient</SelectItem>
            <SelectItem value="Appointment">Appointment</SelectItem>
            <SelectItem value="Medicine">Medicine</SelectItem>
            <SelectItem value="Sale">Sale</SelectItem>
            <SelectItem value="Prescription">Prescription</SelectItem>
            <SelectItem value="Organization">Organization</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={(v) => setActionFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log ({total} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No audit logs found</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge className={actionColors[log.action] || "bg-gray-100 text-gray-700"}>
                      {log.action}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{log.entity}</p>
                      {log.entityId && <p className="text-xs text-gray-400">{log.entityId.slice(0, 8)}...</p>}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(log.createdAt).toLocaleString("en-IN")}</p>
                    {log.ipAddress && <p className="text-xs">{log.ipAddress}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {total > limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
