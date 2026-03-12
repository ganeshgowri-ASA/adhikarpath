"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, XCircle, Users, Send } from "lucide-react";

interface SystemAccess {
  id: string;
  systemId: string;
  status: string;
  lastLogon: string | null;
  system: {
    id: string;
    systemName: string;
    business: { id: string; name: string };
  };
  userRoleCount: number;
}

interface TeamUser {
  id: string;
  empId: string;
  name: string;
  email: string;
  position: string;
  accesses?: SystemAccess[];
  accessesLoaded?: boolean;
}

type CertAction = "RETAIN" | "REVOKE" | null;

interface CertState {
  [rowKey: string]: CertAction; // rowKey = `${userId}::${systemId}`
}

export function AccessReviewClient() {
  useSession();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certState, setCertState] = useState<CertState>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      const rawUsers: TeamUser[] = (data.users || []).map((u: TeamUser) => ({
        ...u,
        accesses: undefined,
        accessesLoaded: false,
      }));
      // Load accesses for all users
      const enriched = await Promise.all(
        rawUsers.map(async (u) => {
          try {
            const ar = await fetch(`/api/access?userId=${u.id}`);
            const ad = await ar.json();
            return { ...u, accesses: ad.accesses || [], accessesLoaded: true };
          } catch {
            return { ...u, accesses: [], accessesLoaded: true };
          }
        })
      );
      setUsers(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const allRows: string[] = [];
  users.forEach((u) => {
    (u.accesses || []).forEach((a) => {
      allRows.push(`${u.id}::${a.systemId}`);
    });
  });

  const reviewedCount = allRows.filter((k) => certState[k] !== undefined && certState[k] !== null).length;
  const totalRows = allRows.length;
  const progressPct = totalRows > 0 ? Math.round((reviewedCount / totalRows) * 100) : 0;

  const setCert = (userId: string, systemId: string, action: CertAction) => {
    setCertState((s) => ({ ...s, [`${userId}::${systemId}`]: action }));
  };

  const toggleSelect = (rowKey: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedRows(new Set(allRows));
  };

  const clearSelection = () => setSelectedRows(new Set());

  const batchAction = (action: CertAction) => {
    const updates: CertState = {};
    selectedRows.forEach((k) => { updates[k] = action; });
    setCertState((s) => ({ ...s, ...updates }));
    clearSelection();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // In production: POST /api/access-review with certState
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle className="text-green-500" size={56} />
        <h2 className="text-xl font-semibold text-gray-800">Certification Submitted</h2>
        <p className="text-gray-500 text-sm">Access review certification has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users size={16} style={{ color: "#1565C0" }} />
            Review Progress
          </div>
          <span className="text-sm text-gray-500">
            {reviewedCount} of {totalRows} reviewed ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, backgroundColor: "#1565C0" }}
          />
        </div>
      </div>

      {/* Batch Actions */}
      {totalRows > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Select All ({allRows.length})
          </button>
          {selectedRows.size > 0 && (
            <>
              <span className="px-3 py-1.5 text-xs text-gray-500">{selectedRows.size} selected</span>
              <button
                onClick={() => batchAction("RETAIN")}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={12} /> Retain All Selected
              </button>
              <button
                onClick={() => batchAction("REVOKE")}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle size={12} /> Revoke All Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-700" size={28} /></div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                {["Employee", "System", "Business", "Roles", "Last Logon", "Certify"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No team members found</td>
                </tr>
              )}
              {users.map((user) =>
                (user.accesses || []).length === 0 ? (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.empId}</p>
                    </td>
                    <td colSpan={5} className="px-4 py-3 text-xs text-gray-400 italic">No system access</td>
                  </tr>
                ) : (
                  (user.accesses || []).map((access, aIdx) => {
                    const rowKey = `${user.id}::${access.systemId}`;
                    const cert = certState[rowKey];
                    const isSelected = selectedRows.has(rowKey);
                    return (
                      <tr
                        key={rowKey}
                        className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""} ${cert === "RETAIN" ? "bg-green-50" : cert === "REVOKE" ? "bg-red-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(rowKey)}
                            className="w-4 h-4 accent-blue-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {aIdx === 0 && (
                            <>
                              <p className="font-medium text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.empId}</p>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{access.system.systemName}</td>
                        <td className="px-4 py-3 text-gray-600">{access.system.business?.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {access.userRoleCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {access.lastLogon
                            ? new Date(access.lastLogon).toLocaleDateString()
                            : <span className="text-gray-300">Never</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => setCert(user.id, access.systemId, "RETAIN")}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                cert === "RETAIN"
                                  ? "bg-green-600 text-white"
                                  : "border border-green-500 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              <CheckCircle size={12} /> Retain
                            </button>
                            <button
                              onClick={() => setCert(user.id, access.systemId, "REVOKE")}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                cert === "REVOKE"
                                  ? "bg-red-600 text-white"
                                  : "border border-red-400 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              <XCircle size={12} /> Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Certification */}
      {reviewedCount === totalRows && totalRows > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50 hover:opacity-90 transition-colors shadow"
            style={{ backgroundColor: "#1565C0" }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Certification
          </button>
        </div>
      )}
    </div>
  );
}
