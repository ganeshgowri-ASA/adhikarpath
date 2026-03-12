"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  X,
  HelpCircle,
  MessageSquare,
  FileText,
} from "lucide-react";

interface DashboardData {
  pendingApprovals: number;
  myRequests: number;
  myAccessCount: number;
  quickLinks: QuickLink[];
  helpDocs: HelpDoc[];
}

interface QuickLink {
  id: string;
  linkName: string;
  linkUrl: string;
  linkType: string;
}

interface HelpDoc {
  id: string;
  title: string;
}

const carouselSlides = [
  {
    title: "Welcome to AdhikarPath",
    subtitle: "Enterprise Access Management Portal",
    description: "Manage your access, roles, and authorisations across all enterprise systems from one place.",
    cta: { label: "Request Access", href: "/auth-request/new" },
    bg: "from-[#1565C0] to-[#003c8f]",
  },
  {
    title: "Streamlined Approvals",
    subtitle: "Multi-level Workflow",
    description: "Access requests follow a structured Employee → L1 Manager → Role Owner workflow for compliance.",
    cta: { label: "View My Requests", href: "/auth-request/new" },
    bg: "from-[#0277bd] to-[#004c8c]",
  },
  {
    title: "Access Review Due",
    subtitle: "Quarterly Certification",
    description: "Complete your team's access review to ensure compliance with security policies.",
    cta: { label: "Start Review", href: "/access-review" },
    bg: "from-[#00695c] to-[#004d40]",
  },
];

export function DashboardClient({ userId, userName }: { userId: string; userName: string }) {
  const [slide, setSlide] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [quickLinksModal, setQuickLinksModal] = useState(false);
  const [newLink, setNewLink] = useState({ linkName: "", linkUrl: "", linkType: "INTERNAL" });
  const [helpOpen, setHelpOpen] = useState(false);
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } catch {}
  }

  async function addQuickLink() {
    if (!newLink.linkName || !newLink.linkUrl) return;
    setAddingLink(true);
    try {
      const res = await fetch("/api/quick-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });
      if (res.ok) {
        await fetchDashboard();
        setNewLink({ linkName: "", linkUrl: "", linkType: "INTERNAL" });
      }
    } finally {
      setAddingLink(false);
    }
  }

  async function removeQuickLink(id: string) {
    await fetch(`/api/quick-links?id=${id}`, { method: "DELETE" });
    await fetchDashboard();
  }

  const s = carouselSlides[slide];

  return (
    <div className="p-6 space-y-6">
      {/* Hero Carousel */}
      <div className={`relative rounded-2xl bg-gradient-to-r ${s.bg} text-white overflow-hidden`} style={{ minHeight: 200 }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-10 top-10 w-40 h-40 rounded-full border-2 border-white/30" />
          <div className="absolute right-20 top-20 w-24 h-24 rounded-full border border-white/20" />
          <div className="absolute left-1/2 bottom-0 w-80 h-80 rounded-full border border-white/10" />
        </div>
        <div className="relative px-8 py-8 max-w-2xl">
          <p className="text-sm text-white/70 font-medium uppercase tracking-widest mb-1">{s.subtitle}</p>
          <h2 className="text-3xl font-bold mb-3">{s.title}</h2>
          <p className="text-white/80 mb-5 text-sm leading-relaxed">{s.description}</p>
          <Link
            href={s.cta.href}
            className="inline-flex items-center gap-2 bg-white text-[#1565C0] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            {s.cta.label}
          </Link>
        </div>
        {/* Carousel Controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setSlide((s) => (s - 1 + carouselSlides.length) % carouselSlides.length)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === slide ? "bg-white scale-125" : "bg-white/40"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setSlide((s) => (s + 1) % carouselSlides.length)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Approvals Widget */}
        <Link href="/manager-dashboard" className="adhikar-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Approvals</p>
            <p className="text-3xl font-bold text-purple-600 group-hover:text-purple-700">
              {data?.pendingApprovals ?? "—"}
            </p>
          </div>
        </Link>

        {/* My Requests Widget */}
        <Link href="/auth-request/new" className="adhikar-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-[#1565C0]" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">My Requests</p>
            <p className="text-3xl font-bold text-[#1565C0] group-hover:text-[#003c8f]">
              {data?.myRequests ?? "—"}
            </p>
          </div>
        </Link>

        {/* My Access Widget */}
        <Link href="/my-access" className="adhikar-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Monitor className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Systems</p>
            <p className="text-3xl font-bold text-green-600 group-hover:text-green-700">
              {data?.myAccessCount ?? "—"}
            </p>
          </div>
        </Link>
      </div>

      {/* Lower row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links Card */}
        <div className="adhikar-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Quick Links</h3>
            <button
              onClick={() => setQuickLinksModal(true)}
              className="text-xs text-[#1565C0] hover:underline font-medium"
            >
              Manage
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data?.quickLinks || []).slice(0, 8).map((link) => (
              <a
                key={link.id}
                href={link.linkUrl}
                target={link.linkType === "EXTERNAL" ? "_blank" : undefined}
                rel={link.linkType === "EXTERNAL" ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 text-sm text-[#1565C0] bg-blue-50 hover:bg-blue-100 rounded-lg py-2 px-3 transition-colors truncate"
              >
                {link.linkType === "EXTERNAL" && <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{link.linkName}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Help Documents Card */}
        <div className="adhikar-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Help Documents</h3>
            <Link href="/help" className="text-xs text-[#1565C0] hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.helpDocs || []).map((doc) => (
              <Link
                key={doc.id}
                href={`/help#${doc.id}`}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-[#1565C0] shrink-0" />
                <span className="text-sm text-gray-700">{doc.title}</span>
              </Link>
            ))}
            {!data?.helpDocs?.length && (
              <p className="text-sm text-gray-500 text-center py-4">Loading help docs...</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Modal */}
      {quickLinksModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Manage Quick Links</h3>
              <button onClick={() => setQuickLinksModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
              {(data?.quickLinks || []).map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{link.linkName}</p>
                    <p className="text-xs text-gray-400 truncate">{link.linkUrl}</p>
                  </div>
                  <button
                    onClick={() => removeQuickLink(link.id)}
                    className="text-red-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 space-y-3">
              <p className="text-sm font-medium text-gray-700">Add New Link</p>
              <input
                placeholder="Link Name"
                value={newLink.linkName}
                onChange={(e) => setNewLink((n) => ({ ...n, linkName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
              <input
                placeholder="URL (https://...)"
                value={newLink.linkUrl}
                onChange={(e) => setNewLink((n) => ({ ...n, linkUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
              <select
                value={newLink.linkType}
                onChange={(e) => setNewLink((n) => ({ ...n, linkType: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              >
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
              </select>
              <button
                onClick={addQuickLink}
                disabled={addingLink}
                className="w-full flex items-center justify-center gap-2 bg-[#1565C0] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#003c8f] transition-colors disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEED HELP FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        {helpOpen && (
          <div className="mb-3 bg-white rounded-xl shadow-xl border border-gray-200 w-72 overflow-hidden">
            <div className="bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="font-semibold text-sm">Need Help?</span>
              </div>
              <button onClick={() => setHelpOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/help"
                onClick={() => setHelpOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-[#1565C0]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Help Documentation</p>
                  <p className="text-xs text-gray-500">Browse guides and FAQs</p>
                </div>
              </Link>
              <a
                href="mailto:itsupport@adhikarpath.com"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#1565C0]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Contact IT Helpdesk</p>
                  <p className="text-xs text-gray-500">itsupport@adhikarpath.com</p>
                </div>
              </a>
            </div>
          </div>
        )}
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          className="bg-[#1565C0] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#003c8f] transition-colors flex items-center gap-2 font-semibold text-sm"
        >
          <HelpCircle className="w-5 h-5" />
          NEED HELP
        </button>
      </div>
    </div>
  );
}
