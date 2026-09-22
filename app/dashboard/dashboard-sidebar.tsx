"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
  Star,
  type LucideIcon,
} from "lucide-react";

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

const navItems: {
  title: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "استكشف العقارات",
    href: "/properties",
    icon: Search,
  },
  {
    title: "حجوزاتي",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "المفضلة",
    href: "/dashboard/favorites",
    icon: Heart,
  },
  {
    title: "تقييماتي",
    href: "/dashboard/reviews",
    icon: Star,
  },
  {
    title: "الملف الشخصي",
    href: "/dashboard/profile",
    icon: UserRound,
  },
];

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  const initials =
    user.name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE NAVBAR */}
      {/* ========================================================= */}

      <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-[#020617]/85 px-4 backdrop-blur-2xl lg:hidden">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>

          <div>
            <div className="text-lg font-black tracking-tight text-white">
              سَكَني
            </div>

            <div className="text-[10px] font-medium text-slate-400">
              منصة الإيجار الذكية
            </div>
          </div>
        </Link>

        {/* Mobile controls */}
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
          aria-label="فتح القائمة"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}

      <aside
        className={`
          fixed right-0 top-0 z-50 flex h-screen w-72 flex-col
          border-l border-white/10
          bg-[#050b16]/95
          shadow-2xl shadow-black/40
          backdrop-blur-2xl
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-sky-400/80 to-transparent" />

        {/* ======================================================= */}
        {/* BRAND */}
        {/* ======================================================= */}

        <div className="flex h-24 items-center border-b border-white/10 px-6">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-sky-400/30 blur-xl transition group-hover:bg-sky-400/50" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 shadow-xl shadow-sky-500/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-white">
                سَكَني
              </div>

              <div className="text-[10px] font-medium text-slate-500">
                منصة الإيجار الذكية
              </div>
            </div>
          </Link>
        </div>

        {/* ======================================================= */}
        {/* USER */}
        {/* ======================================================= */}

        <div className="px-4 pt-5">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-sky-500/10 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-sky-500/20">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user.name || "مستخدم سَكَني"}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {user.email || "حساب مستخدم"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

              <span className="text-[11px] text-slate-400">
                الحساب نشط
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* NAVIGATION */}
        {/* ======================================================= */}

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            القائمة الرئيسية
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group relative flex items-center gap-3 rounded-xl
                    px-3 py-3
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-l from-sky-500/15 to-blue-500/10 text-sky-300 shadow-lg shadow-sky-950/20"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute right-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-sky-400 to-blue-600 shadow-lg shadow-sky-500/40" />
                  )}

                  <span
                    className={`
                      flex h-9 w-9 items-center justify-center rounded-xl
                      transition-all
                      ${
                        active
                          ? "bg-sky-400/10 text-sky-300"
                          : "bg-white/[0.03] text-slate-500 group-hover:bg-white/[0.07] group-hover:text-slate-200"
                      }
                    `}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>

                  <span>{item.title}</span>

                  {active && (
                    <span className="mr-auto h-1.5 w-1.5 rounded-full bg-sky-400 shadow-lg shadow-sky-400/70" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ======================================================= */}
        {/* PROMO CARD */}
        {/* ======================================================= */}

        <div className="mt-6 px-4">
          <div className="relative overflow-hidden rounded-2xl border border-sky-400/10 bg-gradient-to-br from-sky-500/[0.12] to-blue-600/[0.06] p-4">
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl" />

            <div className="relative">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10">
                <Search className="h-4 w-4 text-sky-300" />
              </div>

              <p className="text-xs font-bold text-white">
                تبحث عن مكان جديد؟
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                اكتشف العقارات المتاحة واختر المكان المناسب لك.
              </p>

              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 transition hover:text-sky-200"
              >
                استكشف الآن
                <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* BOTTOM */}
        {/* ======================================================= */}

        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03]">
              <ArrowLeft className="h-4 w-4" />
            </span>

            <span>العودة للموقع</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] transition group-hover:bg-red-500/10">
              <LogOut className="h-4 w-4" />
            </span>

            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}