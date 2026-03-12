"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, RotateCcw, Search, Info, CheckCircle } from "lucide-react";

interface UserResult {
  id: string;
  empId: string;
  name: string;
  email: string;
  position: string;
}

interface SurrenderedAccess {
  system: string;
  systemId: string;
  surrenderedDate: string;
  daysSince: number;
}

// Demo data - in production this would come from an API
const DEMO_SURRENDERED: SurrenderedAccess[] = [
  { system: "SAP ERP", systemId: "sys-sap-1", surrenderedDate: "2026-02-10", daysSince: 30 },
  { system: "HR Portal", systemId: "sys-hr-2", surrenderedDate: "2025-12-15", daysSince: 87 },
  { system: "Finance System", systemId: "sys-fin-3", surrenderedDate: "2026-03-01", daysSince: 11 },
];

export function ReinstateClient() {
  useSession();
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [reinstating, setReinstating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (q: string) => {
    if (!q.trim()) { setUserResults([]); return; }
    setUserSearching(true);
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUserResults(data.users || []);
    } catch {
      setUserResults([]);
    } finally {
      setUserSearching(false);
    }
  };

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    setUserQuery(user.name);
    setUserResults([]);
    setShowHistory(true);
    setSuccess(null);
    setError(null);
  };

  const handleReinstate = async (access: SurrenderedAccess) => {
    if (!selectedUser) return;
    setReinstating(access.systemId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          systemId: access.systemId,
          requestType: "REINSTATE",
          justification: `Reinstate access to ${access.system} - previously surrendered on ${access.surrenderedDate}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reinstate");
      }
      setSuccess(`Reinstatement request submitted for ${access.system}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reinstatement failed");
    } finally {
      setReinstating(null);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info size={18} className="shrink-0 mt-0.5" style={{ color: "#1565C0" }} />
        <p>
          Access can be reinstated within <strong>60 days</strong> of surrender. After 60 days, a new access request
          is required to regain access.
        </p>
      </div>

      {/* User Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <RotateCcw size={16} style={{ color: "#1565C0" }} /> Search User
        </h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or employee ID..."
            value={userQuery}
            onChange={(e) => { setUserQuery(e.target.value); searchUsers(e.target.value); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {userSearching && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
        {userResults.length > 0 && (
          <ul className="mt-2 border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
            {userResults.map((u) => (
              <li
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.empId} · {u.email}</p>
                </div>
                <span className="text-xs text-gray-400">{u.position}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Success / Error */}
      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <CheckCircle size={16} />{success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Access History Table */}
      {showHistory && selectedUser && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Surrendered Access History for <span style={{ color: "#1565C0" }}>{selectedUser.name}</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["System", "Surrendered Date", "Days Since Surrender", "Eligible for Reinstate", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {DEMO_SURRENDERED.map((access) => {
                  const eligible = access.daysSince < 60;
                  const isReinstating = reinstating === access.systemId;
                  return (
                    <tr key={access.systemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{access.system}</td>
                      <td className="px-4 py-3 text-gray-600">{access.surrenderedDate}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${access.daysSince >= 60 ? "text-red-600" : "text-gray-700"}`}>
                          {access.daysSince} days
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {eligible ? (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">Yes</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {eligible ? (
                          <button
                            onClick={() => handleReinstate(access)}
                            disabled={isReinstating}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition-colors"
                            style={{ backgroundColor: "#1565C0" }}
                          >
                            {isReinstating ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <RotateCcw size={13} />
                            )}
                            Reinstate
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Not eligible</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
