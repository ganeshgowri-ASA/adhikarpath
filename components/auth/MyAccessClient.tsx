"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Monitor, Eye, X, Shield, Activity, Clock } from "lucide-react";

interface SystemAccess {
  id: string;
  systemId: string;
  status: string;
  validFrom: string | null;
  lastLogon: string | null;
  userRoleCount: number;
  system: {
    id: string;
    systemName: string;
    systemCode: string;
    business: { id: string; name: string; code: string };
  };
}

interface Role {
  id: string;
  roleName: string;
  processHierarchyPath: string;
  description: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  REVOKED: "bg-red-100 text-red-600",
};

export function MyAccessClient() {
  useSession();
  const [accesses, setAccesses] = useState<SystemAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Role modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSystem, setModalSystem] = useState<SystemAccess | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const fetchAccesses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access");
      if (!res.ok) throw new Error("Failed to load access data");
      const data = await res.json();
      setAccesses(data.accesses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccesses(); }, [fetchAccesses]);

  const openRolesModal = async (access: SystemAccess) => {
    setModalSystem(access);
    setModalOpen(true);
    setRoles([]);
    setRolesLoading(true);
    try {
      const res = await fetch(`/api/systems/roles?systemId=${access.systemId}`);
      const data = await res.json();
      setRoles(data.roles || []);
    } catch {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  // Summary stats
  const totalSystems = accesses.length;
  const activeRoles = accesses.reduce((sum, a) => sum + a.userRoleCount, 0);
  const dormantCount = accesses.filter((a) => {
    if (!a.lastLogon) return true;
    const days = (Date.now() - new Date(a.lastLogon).getTime()) / (1000 * 60 * 60 * 24);
    return days > 90;
  }).length;

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Monitor size={20} />}
          label="Total Systems"
          value={String(totalSystems)}
          color="#1565C0"
        />
        <StatCard
          icon={<Shield size={20} />}
          label="Active Roles"
          value={String(activeRoles)}
          color="#2e7d32"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Dormant Accesses"
          value={String(dormantCount)}
          color="#e65100"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-700" size={28} /></div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      ) : accesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Monitor size={40} />
          <p className="text-sm">You have no system access assigned</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["System", "Business", "Status", "Valid From", "Last Logon", "Roles", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {accesses.map((access) => {
                const isDormant = !access.lastLogon || (Date.now() - new Date(access.lastLogon).getTime()) / (1000 * 60 * 60 * 24) > 90;
                return (
                  <tr key={access.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Monitor size={15} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">{access.system.systemName}</p>
                          <p className="text-xs text-gray-400">{access.system.systemCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{access.system.business?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[access.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {access.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {access.validFrom ? new Date(access.validFrom).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {access.lastLogon ? (
                        <span className={isDormant ? "text-orange-500 font-medium" : "text-gray-500"}>
                          {new Date(access.lastLogon).toLocaleDateString()}
                          {isDormant && <span className="ml-1 text-xs text-orange-400">(dormant)</span>}
                        </span>
                      ) : (
                        <span className="text-gray-300">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {access.userRoleCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openRolesModal(access)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                      >
                        <Eye size={13} /> View Roles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Modal */}
      {modalOpen && modalSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Shield size={16} style={{ color: "#1565C0" }} />
                  Roles — {modalSystem.system.systemName}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{modalSystem.system.business?.name}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 ml-4">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {rolesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-700" size={24} /></div>
              ) : roles.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No roles found</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {roles.map((role) => (
                    <li key={role.id} className="py-3">
                      <div className="flex items-start gap-2">
                        <Activity size={14} className="mt-0.5 shrink-0" style={{ color: "#1565C0" }} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{role.roleName}</p>
                          {role.processHierarchyPath && (
                            <p className="text-xs text-gray-500 mt-0.5">{role.processHierarchyPath}</p>
                          )}
                          {role.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="shrink-0 pt-3 mt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
