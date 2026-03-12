import Link from "next/link";
import { ShieldCheck, Users, Lock, Activity, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#003c8f] flex flex-col items-center justify-center p-8">
      {/* Logo & Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-6">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
          AdhikarPath
        </h1>
        <p className="text-xl text-blue-100 max-w-lg mx-auto">
          Enterprise Access Management Portal — manage identities, roles, and
          authorisations across all business systems.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        <FeatureCard
          icon={<Users className="w-6 h-6" />}
          title="Identity Management"
          description="Manage employee identities, positions, and organisational hierarchy across all entities."
        />
        <FeatureCard
          icon={<Lock className="w-6 h-6" />}
          title="Access Control"
          description="Request, approve, and provision system access with multi-level approval workflows."
        />
        <FeatureCard
          icon={<Activity className="w-6 h-6" />}
          title="Audit & Compliance"
          description="Full audit trail for every access change, supporting SOX and internal compliance."
        />
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white text-[#1565C0] font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/30"
        >
          Sign In
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-16 text-blue-200 text-sm">
        AdhikarPath v1.0 · Reliance Industries Limited
      </p>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
