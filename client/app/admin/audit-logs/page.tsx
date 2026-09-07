"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Search, ChevronLeft, ChevronRight, Building2, Download } from "lucide-react";

const ACTION_META: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  UPDATE: { bg: "bg-blue-500/10",    text: "text-blue-400" },
  DELETE: { bg: "bg-rose-500/10",    text: "text-rose-400" },
  LOGIN:  { bg: "bg-violet-500/10",  text: "text-violet-400" },
  CANCEL: { bg: "bg-amber-500/10",   text: "text-amber-400" },
};

function getActionMeta(action: string) {
  for (const [key, val] of Object.entries(ACTION_META)) {
    if (action.toUpperCase().includes(key)) return val;
  }
  return { bg: "bg-slate-800", text: "text-slate-400" };
}

function ActionBadge({ action }: { action: string }) {
  const m = getActionMeta(action);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${m.bg} ${m.text}`}>
      {action}
    </span>
  );
}

export default function AdminAuditLogsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [orgId, setOrgId]     = useState("");
  const [entity, setEntity]   = useState("");
  const [action, setAction]   = useState("");
  const [orgs, setOrgs]       = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getSystemAuditLogs({
        organizationId: orgId || undefined,
        entity: entity || undefined,
        action: action || undefined,
        page: p, limit: 50,
      });
      const d = res.data.data;
      setItems(d.items); setTotal(d.total); setPage(d.page); setPages(d.pages);
      setError("");
    } catch { setError("Failed to load audit logs"); }
    setLoading(false);
  }, [orgId, entity, action]);

  useEffect(() => {
    adminApi.getOrganizations().then((res) => setOrgs(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> System Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            All activity across every organization — <span className="text-white font-medium">{total.toLocaleString()}</span> total events
          </p>
        </div>
      </div>

      {error && <div className="px-4 py-2.5 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{error}</div>}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Organization</p>
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)}
            className="h-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none focus:border-rose-500/50 min-w-[200px]">
            <option value="">All organizations</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Entity</p>
          <input value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="e.g. Patient"
            className="h-9 w-36 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none focus:border-rose-500/50 placeholder:text-slate-600" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Action</p>
          <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. CREATE"
            className="h-9 w-32 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none focus:border-rose-500/50 placeholder:text-slate-600" />
        </div>
        <Button size="sm" onClick={() => fetchLogs(1)} disabled={loading}
          className="bg-rose-600 hover:bg-rose-700 text-white gap-2 h-9">
          <Search className="w-3.5 h-3.5" /> Search
        </Button>
      </div>

      {/* Quick action type filters */}
      <div className="flex flex-wrap gap-2">
        {["CREATE", "UPDATE", "DELETE", "LOGIN"].map((act) => {
          const m = getActionMeta(act);
          return (
            <button key={act} onClick={() => { setAction(act === action ? "" : act); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                action === act ? `${m.bg} ${m.text} border-current` : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
              }`}>
              {act}
            </button>
          );
        })}
        {action && (
          <button onClick={() => setAction("")} className="px-3 py-1 rounded-full text-xs text-slate-500 border border-slate-700 hover:border-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl h-64 animate-pulse" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Entity ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">IP Address</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {items.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-300 truncate max-w-[130px]">{log.organization?.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-300">{log.entity}</td>
                  <td className="px-5 py-3 text-[11px] font-mono text-slate-600 hidden md:table-cell truncate max-w-[100px]">
                    {log.entityId ? log.entityId.slice(0, 8) + "…" : "—"}
                  </td>
                  <td className="px-5 py-3 text-[11px] font-mono text-slate-600 hidden lg:table-cell">{log.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-600">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No audit logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Page {page} of {pages} · {total.toLocaleString()} total events
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => fetchLogs(page - 1)} disabled={page <= 1}
                  className="h-7 w-7 p-0 border-slate-700 text-slate-400 hover:bg-slate-800">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => fetchLogs(page + 1)} disabled={page >= pages}
                  className="h-7 w-7 p-0 border-slate-700 text-slate-400 hover:bg-slate-800">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
