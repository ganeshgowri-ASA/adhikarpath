"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, AlertTriangle, CheckCircle, XCircle, X, InboxIcon } from "lucide-react";

interface RequestRole {
  role: { id: string; roleName: string };
}

interface AccessRequest {
  id: string;
  status: string;
  requestType: string;
  createdAt: string;
  requestor: { id: string; name: string; empId: string };
  targetUser: { id: string; name: string; empId: string };
  system: { id: string; systemName: string; systemCode: string };
  requestRoles: RequestRole[];
}

type TabFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export function ManagerDashboardClient() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("PENDING");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [modalRequestId, setModalRequestId] = useState("");
  const [comments, setComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const userRole = (session?.user as { role?: string })?.role;
  const hasAccess = userRole === "L1_MANAGER" || userRole === "ADMIN";

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests?type=pending-l1");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openModal = (id: string, action: "approve" | "reject") => {
    setModalRequestId(id);
    setModalAction(action);
    setComments("");
    setActionError("");
    setActionSuccess("");
    setModalOpen(true);
  };

  const handleAction = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/requests/${modalRequestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, comments }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      setActionSuccess(`Request ${modalAction === "approve" ? "approved" : "rejected"} successfully.`);
      setModalOpen(false);
      fetchRequests();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return r.status === "PENDING" || r.status === "L1_PENDING";
    if (activeTab === "APPROVED") return r.status === "L1_APPROVED" || r.status === "APPROVED";
    if (activeTab === "REJECTED") return r.status === "REJECTED" || r.status === "L1_REJECTED";
    return true;
  });

  const tabs: TabFilter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div>
      {!hasAccess && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span>You do not have the L1 Manager or Admin role. Access may be restricted.</span>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <CheckCircle size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-700" size={28} /></div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <InboxIcon size={40} />
          <p className="text-sm">No {activeTab.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Request ID", "Requestor", "Target User", "System", "Type", "Roles", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{req.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{req.requestor.name}</p>
                    <p className="text-xs text-gray-400">{req.requestor.empId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{req.targetUser.name}</p>
                    <p className="text-xs text-gray-400">{req.targetUser.empId}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{req.system.systemName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {req.requestType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {req.requestRoles.slice(0, 2).map((rr) => rr.role.roleName).join(", ")}
                    {req.requestRoles.length > 2 && ` +${req.requestRoles.length - 2} more`}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {(req.status === "PENDING" || req.status === "L1_PENDING") && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(req.id, "approve")}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => openModal(req.id, "reject")}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                    {req.status !== "PENDING" && req.status !== "L1_PENDING" && (
                      <StatusBadge status={req.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                {modalAction === "approve" ? "Approve Request" : "Reject Request"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Request ID: <span className="font-mono font-medium">{modalRequestId.slice(0, 8)}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {actionError && (
              <p className="mt-2 text-sm text-red-600">{actionError}</p>
            )}
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors ${
                  modalAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                {modalAction === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-green-50 text-green-700",
    L1_APPROVED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
    L1_REJECTED: "bg-red-50 text-red-700",
    PENDING: "bg-yellow-50 text-yellow-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
