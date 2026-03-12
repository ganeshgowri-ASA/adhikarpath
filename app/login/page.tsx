"use client";

import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

// ─── OAuth provider config ────────────────────────────────────────────────────
// Set NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true / NEXT_PUBLIC_MICROSOFT_AUTH_ENABLED=true
// in your environment once you have OAuth credentials configured.
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
const MICROSOFT_ENABLED = process.env.NEXT_PUBLIC_MICROSOFT_AUTH_ENABLED === "true";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-gray-400 uppercase tracking-wide">
          or continue with
        </span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#F25022" />
      <path d="M24 24H12.6V12.6H24V24z" fill="#00A4EF" />
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#7FBA00" />
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#FFB900" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthAlert, setOauthAlert] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);

  // ── Credentials login ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOauthAlert(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  // ── OAuth sign-in ────────────────────────────────────────────────────────────
  function handleOAuth(provider: "google" | "microsoft-entra-id", enabled: boolean) {
    setOauthAlert(null);
    setError(null);

    if (!enabled) {
      const varNames =
        provider === "google"
          ? "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
          : "MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_TENANT_ID";
      setOauthAlert(
        `Coming soon — set ${varNames} in your environment variables to enable this sign-in option.`
      );
      return;
    }

    setOauthLoading(provider === "google" ? "google" : "microsoft");
    signIn(provider, { callbackUrl: "/dashboard" }).catch(() => {
      setOauthLoading(null);
      setError("OAuth sign-in failed. Please try again.");
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#003c8f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Brand header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AdhikarPath</h1>
          <p className="text-blue-100 mt-1 text-sm">Enterprise Access Management Portal</p>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-6">Use your corporate credentials or SSO</p>

          {/* ── Alerts ───────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {oauthAlert && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{oauthAlert}</span>
            </div>
          )}

          {/* ── OAuth buttons ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => handleOAuth("google", GOOGLE_ENABLED)}
              disabled={oauthLoading !== null || isPending}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("microsoft-entra-id", MICROSOFT_ENABLED)}
              disabled={oauthLoading !== null || isPending}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === "microsoft" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MicrosoftIcon />
              )}
              Microsoft
            </button>
          </div>

          <Divider />

          {/* ── Credentials form ──────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@adhikarpath.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/login/forgot-password"
                  className="text-xs text-[#1565C0] hover:text-[#003c8f] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── Remember me ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1565C0] focus:ring-[#1565C0] cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending || oauthLoading !== null}
              className="w-full bg-[#1565C0] text-white font-semibold py-2.5 rounded-lg hover:bg-[#003c8f] active:bg-[#002266] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* ── Demo credentials ───────────────────────────────────────────── */}
          <details className="mt-5">
            <summary className="text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none">
              Demo credentials (click to expand)
            </summary>
            <div className="mt-2 text-xs text-gray-400 space-y-1 bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <span className="font-medium text-gray-500">Employee</span>
                <span>gowri.ganesh@adhikarpath.com / GowriGanesh@2024</span>
                <span className="font-medium text-gray-500">Manager</span>
                <span>amit.verma@adhikarpath.com / TeamLead@2024</span>
                <span className="font-medium text-gray-500">Role Owner</span>
                <span>deepak.nair@adhikarpath.com / Deepak@2024</span>
              </div>
            </div>
          </details>
        </div>

        <p className="text-center text-blue-200 text-sm mt-6">
          Contact{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-white transition-colors">
            IT Helpdesk
          </span>{" "}
          for access issues
        </p>
      </div>
    </div>
  );
}
