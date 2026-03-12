"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, ChevronRight, ChevronLeft, Search, User, Monitor, Clock, Shield, ClipboardList } from "lucide-react";

interface UserResult {
  id: string;
  empId: string;
  name: string;
  email: string;
  position: string;
  orgUnit: string;
}

interface SystemResult {
  id: string;
  systemName: string;
  systemCode: string;
  business: { id: string; name: string; code: string };
  _count: { roles: number };
}

interface RoleResult {
  id: string;
  roleName: string;
  processHierarchyPath: string;
  description: string;
}

interface FormState {
  targetUser: UserResult | null;
  system: SystemResult | null;
  isTemporary: boolean;
  startDate: string;
  endDate: string;
  justification: string;
  selectedRoles: RoleResult[];
}

const STEPS = [
  { label: "Select User", icon: User },
  { label: "Select System", icon: Monitor },
  { label: "Access Type", icon: Clock },
  { label: "Select Roles", icon: Shield },
  { label: "Review & Submit", icon: ClipboardList },
];

export function RequestAuthClient() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<FormState>({
    targetUser: null,
    system: null,
    isTemporary: false,
    startDate: "",
    endDate: "",
    justification: "",
    selectedRoles: [],
  });

  // Step 1 state
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [userSearching, setUserSearching] = useState(false);

  // Step 2 state
  const [systemQuery, setSystemQuery] = useState("");
  const [systemResults, setSystemResults] = useState<SystemResult[]>([]);
  const [systemSearching, setSystemSearching] = useState(false);

  // Step 4 state
  const [roleQuery, setRoleQuery] = useState("");
  const [roleResults, setRoleResults] = useState<RoleResult[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const searchUsers = useCallback(async (q: string) => {
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
  }, []);

  const searchSystems = useCallback(async (q: string) => {
    if (!q.trim()) { setSystemResults([]); return; }
    setSystemSearching(true);
    try {
      const res = await fetch(`/api/systems?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSystemResults(data.systems || []);
    } catch {
      setSystemResults([]);
    } finally {
      setSystemSearching(false);
    }
  }, []);

  const loadRoles = useCallback(async (systemId: string, q = "") => {
    setRolesLoading(true);
    try {
      const res = await fetch(`/api/systems/roles?systemId=${systemId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setRoleResults(data.roles || []);
    } catch {
      setRoleResults([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const handleSelectUser = (user: UserResult) => {
    setForm((f) => ({ ...f, targetUser: user }));
    setUserResults([]);
    setUserQuery(user.name);
  };

  const handleSelectSelf = () => {
    if (!session?.user) return;
    const me: UserResult = {
      id: session.user.id ?? "",
      empId: "",
      name: session.user.name ?? "Me",
      email: session.user.email ?? "",
      position: "",
      orgUnit: "",
    };
    setForm((f) => ({ ...f, targetUser: me }));
    setUserQuery(me.name);
    setUserResults([]);
  };

  const handleSelectSystem = (sys: SystemResult) => {
    setForm((f) => ({ ...f, system: sys, selectedRoles: [] }));
    setSystemResults([]);
    setSystemQuery(sys.systemName);
  };

  const toggleRole = (role: RoleResult) => {
    setForm((f) => {
      const exists = f.selectedRoles.find((r) => r.id === role.id);
      return {
        ...f,
        selectedRoles: exists
          ? f.selectedRoles.filter((r) => r.id !== role.id)
          : [...f.selectedRoles, role],
      };
    });
  };

  const canProceed = (): boolean => {
    if (currentStep === 0) return !!form.targetUser;
    if (currentStep === 1) return !!form.system;
    if (currentStep === 2) {
      if (form.justification.trim().length < 20) return false;
      if (form.isTemporary && (!form.startDate || !form.endDate)) return false;
      return true;
    }
    if (currentStep === 3) return form.selectedRoles.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && form.system) {
      loadRoles(form.system.id);
    }
    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: form.targetUser?.id,
          systemId: form.system?.id,
          roleIds: form.selectedRoles.map((r) => r.id),
          justification: form.justification,
          requestType: "NEW_ACCESS",
          isTemporary: form.isTemporary,
          ...(form.isTemporary && { startDate: form.startDate, endDate: form.endDate }),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle className="text-green-500" size={56} />
        <h2 className="text-xl font-semibold text-gray-800">Request Submitted Successfully</h2>
        <p className="text-gray-500 text-sm">Your access request has been submitted for approval.</p>
        <button
          onClick={() => { setSubmitted(false); setCurrentStep(0); setForm({ targetUser: null, system: null, isTemporary: false, startDate: "", endDate: "", justification: "", selectedRoles: [] }); setUserQuery(""); setSystemQuery(""); }}
          className="mt-4 px-5 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: "#1565C0" }}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  style={isActive ? { backgroundColor: "#1565C0" } : undefined}
                >
                  {isDone ? <CheckCircle size={18} /> : <Icon size={16} />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-blue-800" : isDone ? "text-green-600" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 ${idx < currentStep ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Step 1: Select User */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Select Target User</h3>
            <button
              onClick={handleSelectSelf}
              className="w-full text-left px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Request for myself ({session?.user?.name})
            </button>
            <p className="text-center text-xs text-gray-400">— or search for another user —</p>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or employee ID..."
                value={userQuery}
                onChange={(e) => { setUserQuery(e.target.value); searchUsers(e.target.value); }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
            </div>
            {userResults.length > 0 && (
              <ul className="border border-gray-200 rounded-lg divide-y max-h-52 overflow-y-auto">
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
            {form.targetUser && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <CheckCircle size={16} />
                <span>Selected: <strong>{form.targetUser.name}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select System */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Select System</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search systems..."
                value={systemQuery}
                onChange={(e) => { setSystemQuery(e.target.value); searchSystems(e.target.value); }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {systemSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
            </div>
            {systemResults.length > 0 && (
              <ul className="border border-gray-200 rounded-lg divide-y max-h-52 overflow-y-auto">
                {systemResults.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleSelectSystem(s)}
                    className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.systemName}</p>
                      <p className="text-xs text-gray-500">{s.systemCode} · {s.business?.name}</p>
                    </div>
                    <span className="text-xs text-gray-400">{s._count.roles} roles</span>
                  </li>
                ))}
              </ul>
            )}
            {form.system && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <CheckCircle size={16} />
                <span>Selected: <strong>{form.system.systemName}</strong> ({form.system.business?.name})</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Access Type & Justification */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Access Type & Justification</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isTemporary}
                onChange={(e) => setForm((f) => ({ ...f, isTemporary: e.target.checked }))}
                className="w-4 h-4 accent-blue-700"
              />
              <span className="text-sm font-medium text-gray-700">Temporary Access</span>
            </label>
            {form.isTemporary && (
              <div className="grid grid-cols-2 gap-4 pl-7">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Business Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe your business reason for this access request (min 20 characters)..."
                value={form.justification}
                onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className={`text-xs mt-1 ${form.justification.length < 20 ? "text-red-500" : "text-green-600"}`}>
                {form.justification.length}/20 minimum characters
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Select Roles */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Select Roles for {form.system?.systemName}</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleQuery}
                onChange={(e) => { setRoleQuery(e.target.value); if (form.system) loadRoles(form.system.id, e.target.value); }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {rolesLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="animate-spin text-blue-700" size={24} /></div>
            ) : (
              <ul className="border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
                {roleResults.length === 0 && (
                  <li className="px-4 py-4 text-center text-sm text-gray-400">No roles found</li>
                )}
                {roleResults.map((role) => {
                  const isChecked = !!form.selectedRoles.find((r) => r.id === role.id);
                  return (
                    <li
                      key={role.id}
                      onClick={() => toggleRole(role)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex gap-3 ${isChecked ? "bg-blue-50" : ""}`}
                    >
                      <input type="checkbox" checked={isChecked} readOnly className="mt-0.5 w-4 h-4 accent-blue-700 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{role.roleName}</p>
                        {role.processHierarchyPath && (
                          <p className="text-xs text-gray-500 mt-0.5">{role.processHierarchyPath}</p>
                        )}
                        {role.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {form.selectedRoles.length > 0 && (
              <p className="text-xs text-blue-700 font-medium">{form.selectedRoles.length} role(s) selected</p>
            )}
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Review & Submit</h3>
            <div className="space-y-3">
              <ReviewRow label="Target User" value={form.targetUser?.name ?? ""} sub={form.targetUser?.empId} />
              <ReviewRow label="System" value={form.system?.systemName ?? ""} sub={form.system?.business?.name} />
              <ReviewRow label="Access Type" value={form.isTemporary ? "Temporary" : "Permanent"} sub={form.isTemporary ? `${form.startDate} to ${form.endDate}` : undefined} />
              <ReviewRow label="Justification" value={form.justification} />
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Requested Roles ({form.selectedRoles.length})</p>
                <ul className="space-y-1">
                  {form.selectedRoles.map((r) => (
                    <li key={r.id} className="text-sm text-gray-700 flex gap-2 items-start">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{r.roleName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{submitError}</div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:opacity-90"
            style={{ backgroundColor: "#1565C0" }}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 transition-colors hover:opacity-90"
            style={{ backgroundColor: "#1565C0" }}
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Request"}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-32 shrink-0 pt-0.5">{label}</span>
      <div>
        <p className="text-sm text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}
