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
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusMap = {
  PENDING: {
    label: "قيد الانتظار",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },

  CONFIRMED: {
    label: "مؤكد",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },

  CANCELLED: {
    label: "ملغي",
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },

  COMPLETED: {
    label: "مكتمل",
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },
} as const;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // المدير ينتقل مباشرة إلى لوحة الإدارة
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
    session.user.name?.split(" ")[0] ||
    "مستخدم";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-sky-400">
                لوحة المستخدم
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                مرحبًا، {firstName} 👋
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                تابع حجوزاتك واستكشف العقارات المتاحة في سَكَني.
              </p>
            </div>

            <Link
              href="/properties"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-950/30 transition hover:from-sky-400 hover:to-blue-500"
            >
              <Home className="h-5 w-5" />
              استكشف العقارات
            </Link>
          </div>
        </header>

        {/* Welcome card */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-slate-900 via-slate-900 to-sky-950/50 p-6 sm:p-8">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10">
                <Home className="h-5 w-5 text-sky-400" />
              </div>

              <h2 className="text-2xl font-black">
                مكانك القادم يبدأ من هنا
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                تصفح العقارات، شاهد الصور والتفاصيل، ثم أرسل
                طلب الحجز بسهولة من مكان واحد.
              </p>
            </div>

            <Link
              href="/properties"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-bold text-sky-300 transition hover:bg-sky-400/20"
            >
              مشاهدة العقارات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="إجمالي الحجوزات"
            value={totalBookings}
            description="جميع طلباتك"
          />

          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            title="قيد الانتظار"
            value={pendingBookings}
            description="بانتظار التأكيد"
          />

          <StatCard
            icon={<CalendarCheck className="h-5 w-5" />}
            title="الحجوزات المؤكدة"
            value={confirmedBookings}
            description="حجوزات مؤكدة"
          />

          <StatCard
            icon={<Heart className="h-5 w-5" />}
            title="المفضلة"
            value={favoritesCount}
            description="العقارات المحفوظة"
          />
        </section>

        {/* Quick actions */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            href="/properties"
            icon={<Home className="h-5 w-5" />}
            title="استكشف العقارات"
            description="ابحث عن مكان مناسب لك"
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
        </section>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Recent bookings */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="font-black">
                  آخر الحجوزات
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  أحدث طلبات الحجز الخاصة بك
                </p>
              </div>

              {recentBookings.length > 0 && (
                <Link
                  href="/dashboard/bookings"
                  className="text-xs font-bold text-sky-400 transition hover:text-sky-300"
                >
                  عرض الكل
                </Link>
              )}
            </div>

            {recentBookings.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                  <CalendarDays className="h-7 w-7 text-slate-600" />
                </div>

                <h3 className="mt-4 font-bold">
                  لا توجد حجوزات حتى الآن
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                  ابدأ باستكشاف العقارات واختر المكان الذي
                  يناسبك.
                </p>

                <Link
                  href="/properties"
                  className="mt-5 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold"
                >
                  استكشف العقارات
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentBookings.map((booking) => {
                  const status =
                    statusMap[booking.status];

                  const image =
                    booking.property.images[0];

                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
                    >
                      {/* Image */}
                      <div className="h-20 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-800 sm:w-28">
                        {image ? (
                          <img
                            src={image.url}
                            alt={booking.property.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-600">
                            لا توجد صورة
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-sky-400">
                            {booking.property.category.name}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <h3 className="mt-2 truncate font-bold">
                          {booking.property.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
                      <div className="shrink-0 sm:text-left">
                        <p className="text-xs text-slate-600">
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

          {/* Account */}
          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600">
                  <UserRound className="h-6 w-6 text-white" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-black">
                    {session.user.name ||
                      "مستخدم سَكَني"}
                  </h2>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    نوع الحساب
                  </span>

                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-300">
                    مستخدم
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    الحجوزات المكتملة
                  </span>

                  <span className="font-bold">
                    {completedBookings}
                  </span>
                </div>
              </div>
            </section>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="group flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-sky-500/30 hover:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                  <UserRound className="h-4 w-4 text-slate-400" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    الملف الشخصي
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    إدارة بيانات حسابك
                  </p>
                </div>
              </div>

              <ArrowLeft className="h-4 w-4 text-slate-600 transition group-hover:-translate-x-1 group-hover:text-sky-400" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-sky-500/20">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
          {icon}
        </div>

        <span className="text-2xl font-black">
          {value}
        </span>
      </div>

      <h3 className="mt-5 text-sm font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}

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
      className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-0.5 hover:border-sky-500/30 hover:bg-slate-900"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 transition group-hover:bg-sky-500 group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-600">
          {description}
        </p>
      </div>

      <ArrowLeft className="h-4 w-4 shrink-0 text-slate-700 transition group-hover:-translate-x-1 group-hover:text-sky-400" />
    </Link>
  );
}