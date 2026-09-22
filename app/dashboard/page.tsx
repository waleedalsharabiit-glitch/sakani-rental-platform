import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Clock3,
  Heart,
  Home,
  MapPin,
  UserRound,
  Sparkles,
  TrendingUp,
  Building2,
  ChevronLeft,
  Star,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusMap = {
  PENDING: {
    label: "قيد الانتظار",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },

  CONFIRMED: {
    label: "مؤكد",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },

  CANCELLED: {
    label: "ملغي",
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
    dot: "bg-red-400",
  },

  COMPLETED: {
    label: "مكتمل",
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
    dot: "bg-sky-400",
  },
} as const;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const userId = session.user.id;

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    favoritesCount,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        userId,
      },
    }),

    prisma.booking.count({
      where: {
        userId,
        status: "PENDING",
      },
    }),

    prisma.booking.count({
      where: {
        userId,
        status: "CONFIRMED",
      },
    }),

    prisma.booking.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),

    prisma.favorite.count({
      where: {
        userId,
      },
    }),

    prisma.booking.findMany({
      where: {
        userId,
      },

      include: {
        property: {
          include: {
            category: true,

            images: {
              orderBy: {
                sortOrder: "asc",
              },

              take: 1,
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 4,
    }),
  ]);

  const firstName =
    session.user.name?.split(" ")[0] || "مستخدم";

  return (
    <main dir="rtl" className="min-h-screen py-6 sm:py-8">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}

      <header className="mb-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
                <Sparkles className="h-4 w-4 text-sky-400" />
              </span>

              <span className="text-xs font-black tracking-widest text-sky-400">
                DASHBOARD
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              مرحبًا،{" "}
              <span className="bg-gradient-to-l from-sky-300 to-blue-500 bg-clip-text text-transparent">
                {firstName}
              </span>{" "}
              👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              أهلاً بك في لوحة سَكَني. تابع حجوزاتك، اكتشف
              العقارات الجديدة، وأدر حسابك من مكان واحد.
            </p>
          </div>

          <Link
            href="/properties"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 px-6 text-sm font-black text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-0.5 hover:from-sky-400 hover:to-blue-500"
          >
            <Building2 className="h-5 w-5" />

            استكشف العقارات

            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* PREMIUM WELCOME HERO */}
      {/* ========================================================= */}

      <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-[#071b32] shadow-2xl shadow-black/20">
        {/* Decorative lights */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="pointer-events-none absolute right-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-sky-400/10 to-transparent" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/10 bg-sky-400/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60" />

              <span className="text-[11px] font-bold text-sky-300">
                حسابك نشط
              </span>
            </div>

            <h2 className="max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">
              مكانك القادم
              <span className="text-sky-400"> يبدأ من هنا.</span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-400">
              تصفح العقارات، شاهد الصور والتفاصيل، وقارن الخيارات
              المتاحة ثم أرسل طلب الحجز بسهولة من منصة سَكَني.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-slate-100"
              >
                ابدأ الاستكشاف

                <ArrowLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                مشاهدة حجوزاتي
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:flex lg:justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-sky-400/10" />

              <div className="absolute inset-5 rounded-full border border-sky-400/10" />

              <div className="absolute inset-10 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-2xl shadow-sky-500/20" />

              <Building2 className="relative z-10 h-12 w-12 text-white" />

              <div className="absolute right-1 top-5 h-3 w-3 rounded-full bg-sky-300 shadow-lg shadow-sky-300/70" />

              <div className="absolute bottom-5 left-3 h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/70" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATS */}
      {/* ========================================================= */}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="إجمالي الحجوزات"
          value={totalBookings}
          description="جميع طلباتك"
          accent="sky"
        />

        <StatCard
          icon={<Clock3 className="h-5 w-5" />}
          title="قيد الانتظار"
          value={pendingBookings}
          description="بانتظار التأكيد"
          accent="amber"
        />

        <StatCard
          icon={<CalendarCheck className="h-5 w-5" />}
          title="الحجوزات المؤكدة"
          value={confirmedBookings}
          description="حجوزات مؤكدة"
          accent="emerald"
        />

        <StatCard
          icon={<Heart className="h-5 w-5" />}
          title="المفضلة"
          value={favoritesCount}
          description="العقارات المحفوظة"
          accent="rose"
        />
      </section>

      {/* ========================================================= */}
      {/* QUICK ACTIONS */}
      {/* ========================================================= */}

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-600">
              QUICK ACCESS
            </p>

            <h2 className="mt-1 text-lg font-black text-white">
              وصول سريع
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            href="/properties"
            icon={<Home className="h-5 w-5" />}
            title="استكشف العقارات"
            description="ابحث عن المكان المناسب لك"
          />

          <QuickAction
            href="/dashboard/bookings"
            icon={<CalendarDays className="h-5 w-5" />}
            title="حجوزاتي"
            description="تابع جميع طلبات الحجز"
          />

          <QuickAction
            href="/dashboard/favorites"
            icon={<Heart className="h-5 w-5" />}
            title="المفضلة"
            description="العقارات التي حفظتها"
          />

          <QuickAction
  href="/dashboard/reviews"
  icon={<Star className="h-5 w-5" />}
  title="تقييماتي"
  description="إدارة تقييماتك وآرائك"
/>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================================= */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ======================================================= */}
        {/* RECENT BOOKINGS */}
        {/* ======================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-white/10 p-6 sm:p-7">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50" />

                <h2 className="font-black text-white">
                  آخر الحجوزات
                </h2>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                أحدث طلبات الحجز الخاصة بك
              </p>
            </div>

            {recentBookings.length > 0 && (
              <Link
                href="/dashboard/bookings"
                className="group flex items-center gap-1 text-xs font-bold text-sky-400 transition hover:text-sky-300"
              >
                عرض الكل

                <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" />
              </Link>
            )}
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-slate-800">
                <div className="absolute inset-0 rounded-3xl bg-sky-500/5 blur-xl" />

                <CalendarDays className="relative h-8 w-8 text-slate-600" />
              </div>

              <h3 className="mt-5 font-black text-white">
                لا توجد حجوزات حتى الآن
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                ابدأ باستكشاف العقارات واختر المكان الذي
                يناسبك.
              </p>

              <Link
                href="/properties"
                className="mt-6 rounded-xl bg-gradient-to-l from-sky-500 to-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5"
              >
                استكشف العقارات
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentBookings.map((booking) => {
                const status = statusMap[booking.status];
                const image = booking.property.images[0];

                return (
                  <div
                    key={booking.id}
                    className="group flex flex-col gap-4 p-5 transition duration-300 hover:bg-white/[0.025] sm:flex-row sm:items-center sm:p-6"
                  >
                    {/* Image */}
                    <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-800 sm:h-20 sm:w-28">
                      {image ? (
                        <>
                          <img
                            src={image.url}
                            alt={booking.property.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-6 w-6 text-slate-700" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-sky-400">
                          {booking.property.category.name}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />

                          {status.label}
                        </span>
                      </div>

                      <h3 className="mt-2 truncate font-black text-white">
                        {booking.property.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />

                          {booking.property.city}
                        </span>

                        <span>
                          {booking.startDate.toLocaleDateString(
                            "ar-YE"
                          )}

                          {" → "}

                          {booking.endDate.toLocaleDateString(
                            "ar-YE"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 border-t border-white/5 pt-3 sm:border-0 sm:pt-0 sm:text-left">
                      <p className="text-[10px] text-slate-600">
                        الإجمالي
                      </p>

                      <p className="mt-1 font-black text-sky-400">
                        {booking.totalPrice.toLocaleString(
                          "ar-YE"
                        )}{" "}
                        ريال
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================= */}
        {/* RIGHT SIDE */}
        {/* ======================================================= */}

        <aside className="space-y-6">
          {/* Profile */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/10">
            <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-950/30">
                  <UserRound className="h-6 w-6 text-white" />

                  <span className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-400" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-black text-white">
                    {session.user.name || "مستخدم سَكَني"}
                  </h2>

                  <p className="mt-1 truncate text-xs text-slate-600">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    نوع الحساب
                  </span>

                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] font-black text-sky-300">
                    مستخدم
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    الحجوزات المكتملة
                  </span>

                  <span className="font-black text-white">
                    {completedBookings}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile link */}
          <Link
            href="/dashboard/profile"
            className="group flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-sky-500/30 hover:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 transition group-hover:bg-sky-500/10">
                <UserRound className="h-4 w-4 text-slate-500 transition group-hover:text-sky-400" />
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  الملف الشخصي
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  إدارة بيانات حسابك
                </p>
              </div>
            </div>

            <ArrowLeft className="h-4 w-4 text-slate-700 transition group-hover:-translate-x-1 group-hover:text-sky-400" />
          </Link>

          {/* Mini information card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-sky-400/10 bg-gradient-to-br from-sky-500/[0.08] to-blue-600/[0.04] p-6">
            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10">
                <TrendingUp className="h-5 w-5 text-sky-400" />
              </div>

              <h3 className="mt-4 font-black text-white">
                كل شيء في مكان واحد
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                أدر حجوزاتك، احفظ العقارات التي تعجبك،
                واستكشف أماكن جديدة بسهولة.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ============================================================= */
/* STAT CARD */
/* ============================================================= */

function StatCard({
  icon,
  title,
  value,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  accent: "sky" | "amber" | "emerald" | "rose";
}) {
  const styles = {
    sky: {
      icon: "bg-sky-500/10 text-sky-400",
      glow: "group-hover:border-sky-500/30",
      number: "text-sky-300",
    },

    amber: {
      icon: "bg-amber-500/10 text-amber-400",
      glow: "group-hover:border-amber-500/20",
      number: "text-amber-300",
    },

    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400",
      glow: "group-hover:border-emerald-500/20",
      number: "text-emerald-300",
    },

    rose: {
      icon: "bg-rose-500/10 text-rose-400",
      glow: "group-hover:border-rose-500/20",
      number: "text-rose-300",
    },
  };

  const style = styles[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-black/5 transition duration-300 hover:-translate-y-1 ${style.glow}`}
    >
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${style.icon}`}
        >
          {icon}
        </div>

        <span
          className={`text-3xl font-black tracking-tight ${style.number}`}
        >
          {value}
        </span>
      </div>

      <h3 className="relative mt-5 text-sm font-black text-white">
        {title}
      </h3>

      <p className="relative mt-1 text-[11px] text-slate-600">
        {description}
      </p>
    </div>
  );
}

/* ============================================================= */
/* QUICK ACTION */
/* ============================================================= */

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
      className="group flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-black/5 transition duration-300 hover:-translate-y-1 hover:border-sky-500/25 hover:bg-slate-900"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 transition duration-300 group-hover:bg-sky-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-sky-500/20">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-black text-white">
          {title}
        </h3>

        <p className="mt-1 text-[11px] text-slate-600">
          {description}
        </p>
      </div>

      <ArrowLeft className="h-4 w-4 shrink-0 text-slate-700 transition duration-300 group-hover:-translate-x-1 group-hover:text-sky-400" />
    </Link>
  );
}