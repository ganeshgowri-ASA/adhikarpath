// /home/user/adhikarpath/components/account/SurrenderAccountClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HandCoins, Check, Loader2, AlertCircle, AlertTriangle, X } from "lucide-react";

interface SystemAccess {
  id: string;
  systemId: string;
  validFrom: string | null;
  status: string;
  system: {
    id: string;
    systemName: string;
    systemCode: string;
    business: { id: string; name: string; code: string };
  };
  _count?: {
    roles: number;
  };
  roleCount?: number;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SurrenderAccountClient() {
  const { data: session } = useSession();
  const [accesses, setAccesses] = useState<SystemAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmSystem, setConfirmSystem] = useState<SystemAccess | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [surrendered, setSurrendered] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; visible: boolean; isError?: boolean }>({
    message: "",
    visible: false,
  });

  useEffect(() => {
    async function fetchAccesses() {
      try {
        const res = await fetch("/api/access");
        if (!res.ok) throw new Error("Failed to load access data");
        const data = await res.json();
        setAccesses(data.accesses || []);
      } catch {
        setError("Unable to load your systems. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchAccesses();
  }, []);

  function showToast(message: string, isError = false) {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: "", visible: false }), 4000);
  }

  async function handleConfirmSurrender() {
    if (!confirmSystem || !session?.user?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: session.user.id,
          requestType: "SURRENDER",
          systemId: confirmSystem.systemId,
          justification: "Account surrender request",
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSurrendered((prev) => new Set(prev).add(confirmSystem.id));
      setConfirmSystem(null);
      showToast(`Surrender request submitted for ${confirmSystem.system.systemName}.`);
    } catch {
      showToast("Failed to submit request. Please try again.", true);
    } finally {
      setSubmitting(false);
    }
  }

  const roleCount = (access: SystemAccess) =>
    access._count?.roles ?? access.roleCount ?? 0;

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Warning: Surrendering access is irreversible.
          </p>
          <p className="text-sm text-amber-700 mt-0.5">
            Ensure you have manager approval before proceeding. Once surrendered, you will lose all
            access to the selected system and must raise a new access request to regain entry.
          </p>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
          <HandCoins className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Surrender System Access</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a system below to voluntarily surrender your access. This action requires manager
            approval and cannot be undone without a new access request.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                System
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Valid From
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : accesses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No active system accesses found.
                </td>
              </tr>
            ) : (
              accesses.map((access) => {
                const isSurrendered = surrendered.has(access.id);
                return (
                  <tr
                    key={access.id}
                    className={`transition-colors ${isSurrendered ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{access.system.systemName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{access.system.systemCode}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{access.system.business.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {access.validFrom
                        ? new Date(access.validFrom).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1565C0]">
                        {roleCount(access)} role{roleCount(access) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isSurrendered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          Requested
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmSystem(access)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <HandCoins className="w-3.5 h-3.5" />
                          Surrender
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setConfirmSystem(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <button
              onClick={() => !submitting && setConfirmSystem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <HandCoins className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Confirm Access Surrender</h3>
                <p className="text-sm text-gray-500">This action cannot be undone without a new access request.</p>
              </div>
            </div>

            {/* Inline warning inside modal */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                You will immediately lose access to this system. All associated roles will be
                removed. This requires manager approval before it is processed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">System</span>
                <span className="font-medium text-gray-900">{confirmSystem.system.systemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Business</span>
                <span className="text-gray-700">{confirmSystem.system.business.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Roles to Remove</span>
                <span className="text-gray-700">{roleCount(confirmSystem)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Request Type</span>
                <span className="text-gray-700">Surrender</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmSystem(null)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSurrender}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm Surrender
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm ${
            toast.isError ? "bg-red-700" : "bg-gray-900"
          }`}
        >
          {toast.isError ? (
            <AlertCircle className="w-4 h-4 text-red-200 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-green-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
