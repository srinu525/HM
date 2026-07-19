"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { publicOrgApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Hospital,
  ArrowRight,
  Stethoscope,
  Pill,
  Calendar,
  Users,
  Activity,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  isActive: boolean;
  _count: { users: number; patients: number };
}

const FEATURES = [
  { icon: Calendar, label: "Appointments", color: "text-blue-600 bg-blue-50" },
  { icon: Stethoscope, label: "Consultations", color: "text-violet-600 bg-violet-50" },
  { icon: Pill, label: "Pharmacy", color: "text-amber-600 bg-amber-50" },
  { icon: Activity, label: "Lab Tests", color: "text-emerald-600 bg-emerald-50" },
  { icon: Shield, label: "Secure Access", color: "text-rose-600 bg-rose-50" },
  { icon: Users, label: "Multi-Role", color: "text-cyan-600 bg-cyan-50" },
];

export default function TenantStartupPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    let cancelled = false;
    async function fetchOrg() {
      try {
        const res = await publicOrgApi.getBySlug(orgSlug);
        if (!cancelled) setOrg(res.data.data);
      } catch {
        if (!cancelled) setError("Organization not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOrg();
    return () => { cancelled = true; };
  }, [orgSlug]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Organization Not Found</h1>
          <p className="text-gray-500 mb-8">
            The organization <span className="font-medium text-gray-700">{orgSlug}</span> doesn&apos;t exist or is inactive.
          </p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="rounded-xl"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (!org.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Organization Inactive</h1>
          <p className="text-gray-500 mb-8">
            <span className="font-medium text-gray-700">{org.name}</span> is currently inactive. Please contact the administrator.
          </p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="rounded-xl"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const initials = org.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight tracking-tight">{org.name}</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Hospital Management</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl"
              onClick={() => router.push(`/${orgSlug}/login`)}
            >
              Staff Login
            </Button>
            <Button
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25"
              onClick={() => router.push("/patient/login")}
            >
              Patient Portal
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 via-white to-white" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-blue-700 rounded-full text-sm font-semibold mb-8 border border-blue-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Welcome to {org.name}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Access your appointments, prescriptions, lab results, and more through our secure patient portal.
            Staff members can sign in to manage operations.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 h-auto text-base"
              onClick={() => router.push(`/${orgSlug}/login`)}
            >
              Staff Login
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 text-gray-600 font-semibold rounded-2xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 h-auto text-base"
              onClick={() => router.push("/patient/login")}
            >
              Patient Portal
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{org._count.users}+</div>
              <div className="mt-1 text-sm text-gray-500 font-medium">Staff Members</div>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{org._count.patients}+</div>
              <div className="mt-1 text-sm text-gray-500 font-medium">Patients Served</div>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 text-violet-600 mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">24/7</div>
              <div className="mt-1 text-sm text-gray-500 font-medium">Availability</div>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">100%</div>
              <div className="mt-1 text-sm text-gray-500 font-medium">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Services Available
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Comprehensive healthcare management at {org.name}.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-gray-900">{feature.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      {(org.email || org.phone || org.address) && (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Contact Us
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {org.phone && (
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{org.phone}</p>
                </div>
              )}
              {org.email && (
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{org.email}</p>
                </div>
              )}
              {org.address && (
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 text-violet-600 mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{org.address}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative p-12 md:p-16 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full" />
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                <Hospital className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                {org.name}
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Managing your healthcare journey with modern technology and compassionate care.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  className="group px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-2xl shadow-black/10 h-auto text-base"
                  onClick={() => router.push(`/${orgSlug}/login`)}
                >
                  Staff Login
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 text-white font-semibold rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 h-auto text-base"
                  onClick={() => router.push("/patient/login")}
                >
                  Patient Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Hospital className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">{org.name}</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {org.name}. Powered by HM System.
          </p>
        </div>
      </footer>
    </div>
  );
}
