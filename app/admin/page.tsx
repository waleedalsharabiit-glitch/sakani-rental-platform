import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [
    usersCount,
    propertiesCount,
    bookingsCount,
    pendingBookingsCount,
    confirmedBookingsCount,
    recentBookings,
    recentProperties,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.property.count(),

    prisma.booking.count(),

    prisma.booking.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            title: true,
          },
        },
      },
    }),

    prisma.property.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#020617]/80 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                <Building2 className="h-4 w-4 text-cyan-300" />
              </div>

              <p className="text-xs font-medium text-slate-500">
                لوحة التحكم
              </p>
            </div>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
              الرئيسية
            </h1>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-white">
                مدير سَكَني
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                admin@sakani.com
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-sm font-bold text-cyan-300 shadow-lg shadow-cyan-950/20">
              م
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-5 sm:p-6 lg:p-8">
        {/* Welcome */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/80 p-7 shadow-2xl shadow-black/20 lg:p-8">
          {/* Decorative Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

              <span className="text-xs font-semibold text-cyan-300">
                نظام إدارة سَكَني
              </span>
            </div>

            <p className="mb-2 text-sm font-medium text-cyan-300">
              مرحبًا بك مجددًا 👋
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              إدارة سَكَني من مكان واحد
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              تابع العقارات والمستخدمين والحجوزات وإحصائيات
              المنصة بسهولة من لوحة التحكم.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="إجمالي المستخدمين"
            value={usersCount}
            icon={<Users className="h-5 w-5" />}
            href="/admin/users"
            iconStyle="cyan"
          />

          <StatCard
            title="العقارات"
            value={propertiesCount}
            icon={<Building2 className="h-5 w-5" />}
            href="/admin/properties"
            iconStyle="blue"
          />

          <StatCard
            title="الحجوزات"
            value={bookingsCount}
            icon={<CalendarDays className="h-5 w-5" />}
            href="/admin/bookings"
            iconStyle="violet"
          />

          <StatCard
            title="قيد الانتظار"
            value={pendingBookingsCount}
            icon={<Clock3 className="h-5 w-5" />}
            href="/admin/bookings"
            iconStyle="amber"
          />

          <StatCard
            title="الحجوزات المؤكدة"
            value={confirmedBookingsCount}
            icon={<CheckCircle2 className="h-5 w-5" />}
            href="/admin/bookings"
            iconStyle="emerald"
          />
        </section>

        {/* Main Content */}
        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          {/* Recent Bookings */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/50 shadow-xl shadow-black/10 backdrop-blur-sm xl:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-bold text-white">
                  آخر الحجوزات
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  أحدث العمليات في المنصة
                </p>
              </div>

              <Link
                href="/admin/bookings"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                عرض الكل

                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>

            {/* Bookings */}
            <div className="divide-y divide-white/[0.05]">
              {recentBookings.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                    <CalendarDays className="h-6 w-6 text-slate-500" />
                  </div>

                  <p className="font-medium text-slate-300">
                    لا توجد حجوزات حتى الآن
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    ستظهر الحجوزات الجديدة هنا.
                  </p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {booking.property.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {booking.user.name ??
                          booking.user.email}
                      </p>
                    </div>

                    <div className="shrink-0 text-left">
                      <BookingStatus
                        status={booking.status}
                      />

                      <p className="mt-2 text-xs font-semibold text-slate-300">
                        {booking.totalPrice.toLocaleString(
                          "ar-YE"
                        )}{" "}
                        ريال
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/[0.07] bg-slate-900/50 p-5 shadow-xl shadow-black/10 backdrop-blur-sm sm:p-6">
            <div>
              <h2 className="font-bold text-white">
                إجراءات سريعة
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                الوصول السريع إلى أهم العمليات
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <QuickAction
                href="/admin/properties/new"
                icon={<Plus className="h-5 w-5" />}
                title="إضافة عقار"
                description="إضافة عقار جديد للمنصة"
              />

              <QuickAction
                href="/admin/properties"
                icon={<Building2 className="h-5 w-5" />}
                title="العقارات"
                description="إدارة جميع العقارات"
              />

              <QuickAction
                href="/admin/users"
                icon={<Users className="h-5 w-5" />}
                title="المستخدمون"
                description="إدارة حسابات المستخدمين"
              />

              <QuickAction
                href="/admin/bookings"
                icon={<CalendarDays className="h-5 w-5" />}
                title="الحجوزات"
                description="متابعة الحجوزات"
              />
            </div>
          </div>
        </section>

        {/* Recent Properties */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/50 shadow-xl shadow-black/10 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold text-white">
                أحدث العقارات
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                آخر العقارات التي تمت إضافتها
              </p>
            </div>

            <Link
              href="/admin/properties"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              عرض الكل

              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/5">
                <Building2 className="h-7 w-7 text-cyan-400" />
              </div>

              <p className="font-semibold text-slate-300">
                لا توجد عقارات حتى الآن
              </p>

              <p className="mt-1 text-xs text-slate-600">
                ابدأ بإضافة أول عقار إلى سَكَني.
              </p>

              <Link
                href="/admin/properties/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/15 hover:text-cyan-200"
              >
                <Plus className="h-4 w-4" />
                إضافة أول عقار
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {property.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {property.city}{" "}
                      <span className="mx-1 text-slate-700">
                        •
                      </span>{" "}
                      {property.category.name}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-cyan-400">
                    {property.price.toLocaleString("ar-YE")}{" "}
                    <span className="text-xs font-medium text-slate-500">
                      ريال
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   Statistics Card
========================================================= */

function StatCard({
  title,
  value,
  icon,
  href,
  iconStyle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  iconStyle:
    | "cyan"
    | "blue"
    | "violet"
    | "amber"
    | "emerald";
}) {
  const styles = {
    cyan: {
      wrapper:
        "border-cyan-400/10 hover:border-cyan-400/25",
      icon: "border-cyan-400/10 bg-cyan-400/10 text-cyan-300",
      glow: "group-hover:bg-cyan-400/[0.03]",
    },

    blue: {
      wrapper:
        "border-blue-400/10 hover:border-blue-400/25",
      icon: "border-blue-400/10 bg-blue-400/10 text-blue-300",
      glow: "group-hover:bg-blue-400/[0.03]",
    },

    violet: {
      wrapper:
        "border-violet-400/10 hover:border-violet-400/25",
      icon: "border-violet-400/10 bg-violet-400/10 text-violet-300",
      glow: "group-hover:bg-violet-400/[0.03]",
    },

    amber: {
      wrapper:
        "border-amber-400/10 hover:border-amber-400/25",
      icon: "border-amber-400/10 bg-amber-400/10 text-amber-300",
      glow: "group-hover:bg-amber-400/[0.03]",
    },

    emerald: {
      wrapper:
        "border-emerald-400/10 hover:border-emerald-400/25",
      icon: "border-emerald-400/10 bg-emerald-400/10 text-emerald-300",
      glow: "group-hover:bg-emerald-400/[0.03]",
    },
  };

  const style = styles[iconStyle];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border bg-slate-900/50 p-5 shadow-lg shadow-black/10 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${style.wrapper}`}
    >
      {/* Hover Glow */}
      <div
        className={`pointer-events-none absolute inset-0 transition ${style.glow}`}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${style.icon}`}
        >
          {icon}
        </div>

        <ArrowUpLeft className="h-4 w-4 text-slate-700 transition group-hover:text-slate-400" />
      </div>

      <div className="relative">
        <p className="mt-5 text-xs font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-white">
          {value.toLocaleString("ar-YE")}
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   Quick Action
========================================================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition duration-200 hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-300 transition group-hover:border-cyan-400/20 group-hover:bg-cyan-400/15">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-200 transition group-hover:text-white">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-600 group-hover:text-slate-500">
          {description}
        </p>
      </div>

      <ArrowLeft className="mr-auto h-4 w-4 shrink-0 text-slate-700 transition group-hover:-translate-x-1 group-hover:text-cyan-400" />
    </Link>
  );
}

/* =========================================================
   Booking Status
========================================================= */

function BookingStatus({
  status,
}: {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED";
}) {
  const styles = {
    PENDING:
      "border-amber-400/10 bg-amber-400/10 text-amber-300",
    CONFIRMED:
      "border-emerald-400/10 bg-emerald-400/10 text-emerald-300",
    CANCELLED:
      "border-red-400/10 bg-red-400/10 text-red-300",
    COMPLETED:
      "border-blue-400/10 bg-blue-400/10 text-blue-300",
  };

  const labels = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغي",
    COMPLETED: "مكتمل",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}