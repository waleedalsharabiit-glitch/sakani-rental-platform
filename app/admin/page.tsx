import Link from "next/link";

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
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          <div>
            <p className="text-sm text-slate-500">
              لوحة التحكم
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              الرئيسية
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-900">
                مدير سَكَني
              </p>

              <p className="text-xs text-slate-500">
                admin@sakani.com
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700">
              م
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 lg:p-8">
        {/* Welcome */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-l from-slate-950 via-slate-900 to-cyan-900 p-7 text-white shadow-xl">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-cyan-300">
              مرحبًا بك مجددًا 👋
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              إدارة سَكَني من مكان واحد
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              تابع العقارات والمستخدمين والحجوزات
              وإحصائيات المنصة بسهولة.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="إجمالي المستخدمين"
            value={usersCount}
            icon="👥"
            href="/admin/users"
          />

          <StatCard
            title="العقارات"
            value={propertiesCount}
            icon="🏠"
            href="/admin/properties"
          />

          <StatCard
            title="الحجوزات"
            value={bookingsCount}
            icon="📅"
            href="/admin/bookings"
          />

          <StatCard
            title="قيد الانتظار"
            value={pendingBookingsCount}
            icon="⏳"
            href="/admin/bookings"
          />

          <StatCard
            title="الحجوزات المؤكدة"
            value={confirmedBookingsCount}
            icon="✓"
            href="/admin/bookings"
          />
        </section>

        {/* Content */}
        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          {/* Recent bookings */}
          <div className="rounded-2xl border bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  آخر الحجوزات
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  أحدث العمليات في المنصة
                </p>
              </div>

              <Link
                href="/admin/bookings"
                className="text-sm font-semibold text-cyan-600 hover:text-cyan-700"
              >
                عرض الكل
              </Link>
            </div>

            <div className="divide-y">
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                    📅
                  </div>

                  <p className="font-medium text-slate-700">
                    لا توجد حجوزات حتى الآن
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    ستظهر الحجوزات الجديدة هنا.
                  </p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.property.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.user.name ??
                          booking.user.email}
                      </p>
                    </div>

                    <div className="text-left">
                      <BookingStatus
                        status={booking.status}
                      />

                      <p className="mt-2 text-sm font-semibold">
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

          {/* Quick actions */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              إجراءات سريعة
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              الوصول السريع إلى أهم العمليات
            </p>

            <div className="mt-6 space-y-3">
              <QuickAction
                href="/admin/properties/new"
                icon="＋"
                title="إضافة عقار"
                description="إضافة عقار جديد للمنصة"
              />

              <QuickAction
                href="/admin/properties"
                icon="🏠"
                title="العقارات"
                description="إدارة جميع العقارات"
              />

              <QuickAction
                href="/admin/users"
                icon="👥"
                title="المستخدمون"
                description="إدارة حسابات المستخدمين"
              />

              <QuickAction
                href="/admin/bookings"
                icon="📅"
                title="الحجوزات"
                description="متابعة الحجوزات"
              />
            </div>
          </div>
        </section>

        {/* Recent properties */}
        <section className="mt-8 rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">
                أحدث العقارات
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                آخر العقارات التي تمت إضافتها
              </p>
            </div>

            <Link
              href="/admin/properties"
              className="text-sm font-semibold text-cyan-600 hover:text-cyan-700"
            >
              عرض الكل
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-3xl">
                🏠
              </div>

              <p className="font-semibold text-slate-700">
                لا توجد عقارات حتى الآن
              </p>

              <p className="mt-1 text-sm text-slate-500">
                ابدأ بإضافة أول عقار إلى سَكَني.
              </p>

              <Link
                href="/admin/properties/new"
                className="mt-5 inline-flex rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                إضافة أول عقار
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-semibold">
                      {property.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {property.city} •{" "}
                      {property.category.name}
                    </p>
                  </div>

                  <p className="font-bold text-cyan-700">
                    {property.price.toLocaleString("ar-YE")} ريال
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

/* Statistics */

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: number;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-xl">
          {icon}
        </div>

        <span className="text-slate-300 transition group-hover:text-cyan-500">
          ←
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </Link>
  );
}

/* Quick Actions */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border p-3 transition hover:border-cyan-200 hover:bg-cyan-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-lg">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* Booking Status */

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
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
    COMPLETED: "bg-blue-50 text-blue-700",
  };

  const labels = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغي",
    COMPLETED: "مكتمل",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}