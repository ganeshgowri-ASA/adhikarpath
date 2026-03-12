"use client";

import { useState } from "react";
import { Search, User, Monitor, FileText, Check, Loader2, ChevronRight } from "lucide-react";

interface UserOption {
  id: string;
  empId: string;
  name: string;
  email: string;
  position?: string;
}

interface System {
  id: string;
  systemCode: string;
  systemName: string;
  business: { name: string; code: string };
}

const STEPS = ["Select User", "Justification", "Select System", "Confirm"];

export function NewAccountClient() {
  const [step, setStep] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [justification, setJustification] = useState("");
  const [systems, setSystems] = useState<System[]>([]);
  const [systemSearch, setSystemSearch] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function searchUsers(q: string) {
    if (q.length < 2) return setUsers([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  async function searchSystems(q: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/systems?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSystems(data.systems || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedUser || selectedSystems.length === 0) return;
    setSubmitting(true);
    try {
      for (const systemId of selectedSystems) {
        await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUserId: selectedUser.id,
            requestType: "NEW_ACCOUNT",
            systemId,
            justification,
          }),
        });
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="adhikar-card p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 mb-6">
          New account request for <strong>{selectedUser?.name}</strong> has been submitted and is pending L1 Manager approval.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(0); setSelectedUser(null); setJustification(""); setSelectedSystems([]); }}
          className="bg-[#1565C0] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#003c8f] transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Steps */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 ${i <= step ? "text-[#1565C0]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                i < step ? "bg-[#1565C0] border-[#1565C0] text-white" :
                i === step ? "border-[#1565C0] text-[#1565C0]" :
                "border-gray-300 text-gray-400"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select User */}
      {step === 0 && (
        <div className="adhikar-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#1565C0]" />
            Select User
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); searchUsers(e.target.value); }}
              placeholder="Search by name, email, or Employee ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
            />
          </div>
          {loading && <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Searching...</p>}
          {users.length > 0 && (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u); setUserSearch(u.name); setUsers([]); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors ${selectedUser?.id === u.id ? "bg-blue-50" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1565C0] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {u.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.empId} · {u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedUser && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1565C0] text-white flex items-center justify-center text-xs font-bold">
                {selectedUser.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.empId} · {selectedUser.position}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!selectedUser}
              className="bg-[#1565C0] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#003c8f] transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Justification */}
      {step === 1 && (
        <div className="adhikar-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1565C0]" />
            Business Justification
          </h2>
          <p className="text-sm text-gray-500">Provide a business reason for creating this new account.</p>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Describe the business need for this access..."
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0] resize-none"
          />
          <p className="text-xs text-gray-400">{justification.length}/500 characters (minimum 20)</p>
          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="text-gray-600 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">Back</button>
            <button
              onClick={() => setStep(2)}
              disabled={justification.length < 20}
              className="bg-[#1565C0] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#003c8f] transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Systems */}
      {step === 2 && (
        <div className="adhikar-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#1565C0]" />
            Select System(s)
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={systemSearch}
              onChange={(e) => { setSystemSearch(e.target.value); searchSystems(e.target.value); }}
              onFocus={() => { if (systems.length === 0) searchSystems(""); }}
              placeholder="Search systems..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
            />
          </div>
          {loading && <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</p>}
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-100">
            {systems.map((sys) => (
              <label key={sys.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSystems.includes(sys.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedSystems((s) => [...s, sys.id]);
                    else setSelectedSystems((s) => s.filter((id) => id !== sys.id));
                  }}
                  className="rounded border-gray-300 text-[#1565C0]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{sys.systemName}</p>
                  <p className="text-xs text-gray-500">{sys.systemCode} · {sys.business.name}</p>
                </div>
              </label>
            ))}
          </div>
          {selectedSystems.length > 0 && (
            <p className="text-sm text-blue-600 font-medium">{selectedSystems.length} system(s) selected</p>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="text-gray-600 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedSystems.length === 0}
              className="bg-[#1565C0] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#003c8f] transition-colors disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="adhikar-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Review & Submit</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Target User</p>
              <p className="font-medium text-gray-900">{selectedUser?.name}</p>
              <p className="text-sm text-gray-500">{selectedUser?.empId} · {selectedUser?.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Justification</p>
              <p className="text-sm text-gray-700">{justification}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Systems ({selectedSystems.length})</p>
              <div className="space-y-1">
                {selectedSystems.map((id) => {
                  const sys = systems.find((s) => s.id === id);
                  return sys ? (
                    <p key={id} className="text-sm text-gray-700">• {sys.systemName}</p>
                  ) : null;
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="text-gray-600 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#1565C0] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#003c8f] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
