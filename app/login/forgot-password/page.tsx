"use client";

import { ShieldCheck, ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      // Simulate network latency for a realistic UX
      await new Promise((r) => setTimeout(r, 1200));
      // NOTE: No actual email is sent in demo mode.
      // When a real email provider is configured, call the API here:
      //   await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) })
      setSubmitted(true);
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

          {submitted ? (
            /* ── Success state ─────────────────────────────────────────────── */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-1">
                If <span className="font-medium text-gray-700">{email}</span> is registered, we&apos;ve
                sent a password reset link.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Didn&apos;t receive it? Check your spam folder or contact IT Helpdesk.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full bg-[#1565C0] text-white font-semibold py-2.5 rounded-lg hover:bg-[#003c8f] transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* ── Request form ──────────────────────────────────────────────── */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Forgot your password?</h2>
                <p className="text-sm text-gray-500">
                  Enter your corporate email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@adhikarpath.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#1565C0] text-white font-semibold py-2.5 rounded-lg hover:bg-[#003c8f] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? "Sending reset link…" : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:text-[#003c8f] font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
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
