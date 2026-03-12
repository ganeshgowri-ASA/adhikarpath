import {
  ShieldCheck,
  Users,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1565C0] text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
          <ShieldCheck className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg leading-tight">AdhikarPath</p>
            <p className="text-blue-200 text-xs">Access Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem icon={<ClipboardList className="w-5 h-5" />} label="Dashboard" active />
          <NavItem icon={<Users className="w-5 h-5" />} label="My Access" />
          <NavItem icon={<Clock className="w-5 h-5" />} label="Requests" />
          <NavItem icon={<CheckCircle className="w-5 h-5" />} label="Approvals" />
          <NavItem icon={<AlertCircle className="w-5 h-5" />} label="Notifications" />
          <div className="pt-4 border-t border-white/20 mt-4 space-y-1">
            <NavItem icon={<Settings className="w-5 h-5" />} label="Admin" />
            <NavItem icon={<HelpCircle className="w-5 h-5" />} label="Help" />
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
              GG
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Gowri Ganesh</p>
              <p className="text-xs text-blue-200 truncate">Sr Team Member</p>
            </div>
            <button className="text-blue-200 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, Gowri Ganesh</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Active Systems" value="4" color="text-[#1565C0]" />
            <StatCard label="Assigned Roles" value="3" color="text-green-600" />
            <StatCard label="Pending Requests" value="1" color="text-amber-600" />
            <StatCard label="Pending Approvals" value="0" color="text-purple-600" />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <div className="adhikar-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Access Requests</h2>
                <Link href="/requests" className="text-sm text-[#1565C0] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                <RequestRow
                  ref="ARQ-2024-001"
                  system="SAP ECC – HC Finance"
                  type="Additional Authorisation"
                  status="PENDING"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="adhikar-card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickLinkItem label="New Request" href="/requests/new" />
                <QuickLinkItem label="My Access" href="/access" />
                <QuickLinkItem label="System Catalogue" href="/systems" />
                <QuickLinkItem label="Help & Support" href="/help" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={`adhikar-nav-item${active ? " active" : ""}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="adhikar-card p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function RequestRow({
  ref: refNum,
  system,
  type,
  status,
}: {
  ref: string;
  system: string;
  type: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{refNum}</p>
        <p className="text-xs text-gray-500">
          {system} · {type}
        </p>
      </div>
      <span className="text-xs px-2.5 py-1 rounded-full font-medium status-pending">
        {status}
      </span>
    </div>
  );
}

function QuickLinkItem({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center text-sm font-medium text-[#1565C0] bg-blue-50 hover:bg-blue-100 rounded-lg py-2.5 px-3 transition-colors text-center"
    >
      {label}
    </Link>
  );
}
