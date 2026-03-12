"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  UserPlus,
  KeyRound,
  Unlock,
  HandCoins,
  Users,
  Download,
  FileKey,
  ClipboardCheck,
  Star,
  RotateCcw,
  ClipboardList,
  Eye,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const accountServices: NavItem[] = [
  { label: "New Account", href: "/account/new", icon: <UserPlus className="w-4 h-4" /> },
  { label: "Password Reset", href: "/account/password-reset", icon: <KeyRound className="w-4 h-4" /> },
  { label: "Unlock Account", href: "/account/unlock", icon: <Unlock className="w-4 h-4" /> },
  { label: "Surrender Account", href: "/account/surrender", icon: <HandCoins className="w-4 h-4" /> },
  { label: "Manage Consultants", href: "/account/consultants", icon: <Users className="w-4 h-4" /> },
  { label: "Download Resources", href: "/account/downloads", icon: <Download className="w-4 h-4" /> },
];

const authServices: NavItem[] = [
  { label: "Request Authorization", href: "/auth-request/new", icon: <FileKey className="w-4 h-4" /> },
  { label: "Manager Dashboard", href: "/manager-dashboard", icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: "Role Owner Dashboard", href: "/role-owner-dashboard", icon: <Star className="w-4 h-4" /> },
  { label: "Reinstate Access", href: "/reinstate", icon: <RotateCcw className="w-4 h-4" /> },
  { label: "User Access Review", href: "/access-review", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "My Access", href: "/my-access", icon: <Eye className="w-4 h-4" /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(
    accountServices.some((i) => pathname.startsWith(i.href))
  );
  const [authOpen, setAuthOpen] = useState(
    authServices.some((i) => pathname.startsWith(i.href))
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-[#1565C0] text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/20 min-h-[65px]">
        <ShieldCheck className="w-7 h-7 shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight">AdhikarPath</p>
            <p className="text-blue-200 text-xs truncate">Access Management</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-white/70 hover:text-white shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive("/dashboard")
              ? "bg-white/20 text-white font-medium"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
          title="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Dashboard</span>}
        </Link>

        {/* Account Services Accordion */}
        {!collapsed && (
          <div className="pt-2">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/80 transition-colors"
            >
              <span className="flex-1 text-left">Account Services</span>
              {accountOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {accountOpen && (
              <div className="space-y-0.5">
                {accountServices.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.href)
                        ? "bg-white/20 text-white font-medium"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {collapsed &&
          accountServices.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center py-2.5 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-white/20 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
            </Link>
          ))}

        {/* Authorization Services Accordion */}
        {!collapsed && (
          <div className="pt-2">
            <button
              onClick={() => setAuthOpen(!authOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/80 transition-colors"
            >
              <span className="flex-1 text-left">Authorization Services</span>
              {authOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {authOpen && (
              <div className="space-y-0.5">
                {authServices.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.href)
                        ? "bg-white/20 text-white font-medium"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {collapsed &&
          authServices.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center py-2.5 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-white/20 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
            </Link>
          ))}

        {/* Help */}
        <div className={collapsed ? "" : "pt-2 border-t border-white/20 mt-2"}>
          {!collapsed && <div className="h-px bg-white/10 mb-2" />}
          <Link
            href="/help"
            title="Help Center"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              collapsed ? "justify-center" : ""
            } ${
              isActive("/help")
                ? "bg-white/20 text-white font-medium"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">Help Center</span>}
          </Link>
        </div>
      </nav>
    </aside>
  );
}
