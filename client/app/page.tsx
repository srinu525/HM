import Link from "next/link";
import {
  Hospital,
  Shield,
  Users,
  Stethoscope,
  Pill,
  Calendar,
  Activity,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Bell,
  ChevronRight,
  Clock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions for doctors, pharmacists, receptionists, and administrators.",
    bgLight: "from-blue-50 to-indigo-50",
    textColor: "text-blue-600",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Manage appointments, queues, and doctor schedules with real-time updates.",
    bgLight: "from-emerald-50 to-teal-50",
    textColor: "text-emerald-600",
  },
  {
    icon: Pill,
    title: "Pharmacy Management",
    description: "Track inventory, expiry alerts, batch numbers, and process sales seamlessly.",
    bgLight: "from-amber-50 to-orange-50",
    textColor: "text-amber-600",
  },
  {
    icon: Stethoscope,
    title: "Clinical Workflows",
    description: "Consultations, prescriptions, lab tests, and results — all interconnected.",
    bgLight: "from-violet-50 to-purple-50",
    textColor: "text-violet-600",
  },
  {
    icon: Activity,
    title: "Real-Time Updates",
    description: "Instant notifications, live queue management, and Socket.IO-powered alerts.",
    bgLight: "from-rose-50 to-pink-50",
    textColor: "text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Revenue insights, appointment history, and exportable reports for decisions.",
    bgLight: "from-cyan-50 to-sky-50",
    textColor: "text-cyan-600",
  },
];

const STATS = [
  { value: "6+", label: "User Roles", icon: Users },
  { value: "37", label: "Permissions", icon: Shield },
  { value: "13", label: "Modules", icon: Activity },
  { value: "24/7", label: "Availability", icon: Clock },
];

const ROLES = [
  { role: "Administrator", desc: "Manage users, departments, roles, schedules, and settings.", gradient: "from-blue-500 to-blue-600", icon: Shield },
  { role: "Receptionist", desc: "Register patients, book appointments, manage queues.", gradient: "from-emerald-500 to-emerald-600", icon: CheckCircle2 },
  { role: "Doctor", desc: "Consultations, prescriptions, lab orders, and patient records.", gradient: "from-violet-500 to-violet-600", icon: Stethoscope },
  { role: "Pharmacist", desc: "Inventory management, sales processing, dispensing.", gradient: "from-amber-500 to-amber-600", icon: Pill },
  { role: "Patient", desc: "Self-service appointments, prescriptions, lab results.", gradient: "from-rose-500 to-rose-600", icon: Calendar },
  { role: "Super Admin", desc: "Platform management, organizations, analytics.", gradient: "from-slate-600 to-slate-700", icon: BarChart3 },
];

const STEPS = [
  {
    step: "01",
    title: "Register Your Hospital",
    desc: "Create your organization with a unique slug. Your staff and patients get their own secure workspace.",
    icon: Hospital,
  },
  {
    step: "02",
    title: "Configure Roles & Staff",
    desc: "Set up departments, assign roles, manage schedules, and customize permissions.",
    icon: Users,
  },
  {
    step: "03",
    title: "Start Operating",
    desc: "Register patients, write prescriptions, dispense medicines — all connected in real time.",
    icon: Activity,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight tracking-tight">HM System</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Hospital Management</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/default-hospital/login"
              className="hidden sm:inline-flex px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              Staff Login
            </Link>
            <Link
              href="/patient/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Patient Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Static background — no animation */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-blue-50 via-white to-white" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-blue-700 rounded-full text-sm font-semibold mb-10 border border-blue-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Trusted by healthcare professionals worldwide
          </div>

          <h1 className="animate-fade-in-up-delay-1 text-5xl sm:text-6xl md:text-8xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
            Hospital Management
            <br />
            <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="animate-fade-in-up-delay-2 mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A complete multi-tenant platform for managing patients, appointments,
            prescriptions, pharmacy inventory, and clinical workflows — all in one place.
          </p>

          <div className="animate-fade-in-up-delay-3 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/default-hospital/login"
              className="group px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center gap-2.5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/patient/login"
              className="px-8 py-4 text-gray-600 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              Patient Portal
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="animate-fade-in-up-delay-4 mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-3">
                    <StatIcon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Everything your hospital needs
            </h2>
            <p className="mt-5 text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Built for modern healthcare with role-based access, real-time collaboration, and enterprise-grade security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-7 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className={`w-14 h-14 bg-linear-to-br ${feature.bgLight} rounded-2xl flex items-center justify-center mb-5`}>
                    <Icon className={`w-7 h-7 ${feature.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Activity className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="mt-5 text-gray-500 text-lg">
              Three simple steps to streamline your hospital operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-24 left-[17%] right-[17%] h-0.5 bg-linear-to-r from-blue-200 via-cyan-200 to-emerald-200" />

            {STEPS.map((item, i) => {
              const StepIcon = item.icon;
              const colors = [
                { bg: "from-blue-500 to-blue-600", ring: "ring-blue-100", text: "text-blue-600" },
                { bg: "from-cyan-500 to-cyan-600", ring: "ring-cyan-100", text: "text-cyan-600" },
                { bg: "from-emerald-500 to-emerald-600", ring: "ring-emerald-100", text: "text-emerald-600" },
              ][i];

              return (
                <div key={item.step} className="relative text-center">
                  <div className="relative inline-block mb-6">
                    <div className={`w-20 h-20 bg-linear-to-br ${colors.bg} rounded-3xl flex items-center justify-center shadow-xl mx-auto`}>
                      <StepIcon className="w-9 h-9 text-white" />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full ring-4 ${colors.ring} flex items-center justify-center`}>
                      <span className={`text-xs font-extrabold ${colors.text}`}>{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Users className="w-3.5 h-3.5" />
              Roles
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Built for every role
            </h2>
            <p className="mt-5 text-gray-500 text-lg">
              Tailored dashboards and permissions for each team member.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ROLES.map((item) => {
              const RoleIcon = item.icon;
              return (
                <div
                  key={item.role}
                  className="p-7 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-linear-to-r ${item.gradient} text-white text-sm font-semibold mb-4 shadow-md`}>
                    <RoleIcon className="w-4 h-4" />
                    {item.role}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative p-12 md:p-20 bg-linear-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full" />
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Ready to modernize
                <br />
                your hospital?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Start managing patients, appointments, and pharmacy operations with a platform designed for healthcare professionals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/default-hospital/login"
                  className="group px-10 py-5 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-2xl shadow-black/10 flex items-center gap-2.5"
                >
                  Launch HM System
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/patient/login"
                  className="px-10 py-5 text-white font-semibold rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                >
                  Patient Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Hospital className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">HM System</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                A comprehensive multi-tenant hospital management platform built with Next.js, Express, and PostgreSQL.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/default-hospital/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" /> Staff Login
                  </Link>
                </li>
                <li>
                  <Link href="/patient/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" /> Patient Portal
                  </Link>
                </li>
                <li>
                  <Link href="/super-admin" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" /> Super Admin
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3">
                <li className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-gray-400" /> Lab Module
                </li>
                <li className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-gray-400" /> Pharmacy
                </li>
                <li className="text-sm text-gray-500 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-gray-400" /> Analytics
                </li>
                <li className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-gray-400" /> Notifications
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} HM System. Multi-tenant hospital management platform.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              Built with care for healthcare professionals
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
