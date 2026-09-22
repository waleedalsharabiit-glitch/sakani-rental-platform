import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  Mail,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { updateBookingStatus } from "@/actions/admin-bookings";

const statusConfig = {
  PENDING: {
    label: "قيد الانتظار",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    icon: Clock3,
  },

  CONFIRMED: {
    label: "مؤكد",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: "ملغي",
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
    icon: XCircle,
  },

  COMPLETED: {
    label: "مكتمل",
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
    icon: CheckCircle2,
  },
} as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-YE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ar-YE").format(price);
}

function getNights(
  startDate: Date,
  endDate: Date
) {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.ceil(
    (endDate.getTime() - startDate.getTime()) /
      millisecondsPerDay
  );
}

export default async function AdminBookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const bookings = await prisma.booking.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

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
  });

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "PENDING"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status === "CANCELLED"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED"
  ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى لوحة التحكم
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                  <CalendarDays className="h-6 w-6 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-cyan-400">
                    إدارة المنصة
                  </p>

                  <h1 className="text-3xl font-bold">
                    إدارة الحجوزات
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-slate-400">
                راجع طلبات الحجز وتابع حالتها وقم
                بتأكيد أو إلغاء الحجوزات.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 px-5 py-4">
              <p className="text-xs text-slate-500">
                إجمالي الحجوزات
              </p>

              <p className="mt-1 text-3xl font-bold text-cyan-400">
                {totalBookings}
              </p>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="كل الحجوزات"
            value={totalBookings}
            icon={CalendarDays}
          />

          <StatCard
            title="قيد الانتظار"
            value={pendingBookings}
            icon={Clock3}
            tone="amber"
          />

          <StatCard
            title="مؤكدة"
            value={confirmedBookings}
            icon={CheckCircle2}
            tone="green"
          />

          <StatCard
            title="مكتملة"
            value={completedBookings}
            icon={CheckCircle2}
            tone="blue"
          />

          <StatCard
            title="ملغاة"
            value={cancelledBookings}
            icon={XCircle}
            tone="red"
          />

        </section>

        {/* Empty */}
        {bookings.length === 0 ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-14 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-400/10">
              <CalendarDays className="h-10 w-10 text-cyan-400" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              لا توجد حجوزات حتى الآن
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-400">
              عندما يقوم أحد المستخدمين بإنشاء
              حجز، سيظهر هنا تلقائيًا.
            </p>

          </section>
        ) : (

          <section className="space-y-5">

            {bookings.map((booking) => {

              const status =
                statusConfig[booking.status];

              const StatusIcon = status.icon;

              const nights = getNights(
                booking.startDate,
                booking.endDate
              );

              const image =
                booking.property.images[0]?.url;

              return (
                <article
                  key={booking.id}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20 transition hover:border-slate-700"
                >

                  <div className="flex flex-col xl:flex-row">

                    {/* Property Image */}
                    <div className="relative h-56 shrink-0 overflow-hidden bg-slate-800 xl:h-auto xl:w-64">

                      {image ? (
                        <img
                          src={image}
                          alt={booking.property.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Home className="h-14 w-14 text-slate-700" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                      <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 backdrop-blur">
                        {booking.property.category.name}
                      </div>

                    </div>

                    {/* Main */}
                    <div className="flex-1 p-6">

                      {/* Top */}
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <Link
                              href={`/properties/${booking.property.id}`}
                              className="text-xl font-bold transition hover:text-cyan-400"
                            >
                              {booking.property.title}
                            </Link>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>

                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">

                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-cyan-400" />
                              {booking.property.city}
                            </span>

                            <span>
                              {booking.property.address}
                            </span>

                          </div>

                        </div>

                        {/* Total */}
                        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-5 py-3 lg:min-w-40">

                          <p className="text-xs text-slate-500">
                            إجمالي الحجز
                          </p>

                          <p className="mt-1 text-2xl font-bold text-cyan-400">
                            {formatPrice(
                              booking.totalPrice
                            )}{" "}
                            <span className="text-xs font-medium text-slate-400">
                              ريال
                            </span>
                          </p>

                        </div>

                      </div>

                      {/* Customer */}
                      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">

                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                          <Users className="h-4 w-4 text-cyan-400" />
                          بيانات العميل
                        </div>

                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">

                          <div>
                            <p className="text-xs text-slate-500">
                              الاسم
                            </p>

                            <p className="mt-1 font-medium text-slate-200">
                              {booking.user.name ??
                                "بدون اسم"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              البريد الإلكتروني
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 font-medium text-slate-200">
                              <Mail className="h-3.5 w-3.5 text-slate-500" />
                              {booking.user.email}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              رقم الهاتف
                            </p>

                            <p className="mt-1 font-medium text-slate-200">
                              {booking.user.phone ??
                                "غير مضاف"}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* Dates */}
                      <div className="mt-5 grid gap-4 sm:grid-cols-3">

                        <InfoItem
                          label="تاريخ الوصول"
                          value={formatDate(
                            booking.startDate
                          )}
                        />

                        <InfoItem
                          label="تاريخ المغادرة"
                          value={formatDate(
                            booking.endDate
                          )}
                        />

                        <InfoItem
                          label="مدة الإقامة"
                          value={`${nights} ${
                            nights === 1
                              ? "ليلة"
                              : "ليالٍ"
                          }`}
                        />

                      </div>

                      {/* Actions */}
                      {booking.status === "PENDING" && (
                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">

                         <form action={updateBookingStatus}>
                            <input
                              type="hidden"
                              name="bookingId"
                              value={booking.id}
                            />

                            <input
                              type="hidden"
                              name="status"
                              value="CANCELLED"
                            />

                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 sm:w-auto"
                            >
                              <XCircle className="h-4 w-4" />
                              إلغاء الحجز
                            </button>
                          </form>

             <form action={updateBookingStatus}>
                            <input
                              type="hidden"
                              name="bookingId"
                              value={booking.id}
                            />

                            <input
                              type="hidden"
                              name="status"
                              value="CONFIRMED"
                            />

                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:from-cyan-400 hover:to-blue-500 sm:w-auto"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              تأكيد الحجز
                            </button>
                          </form>

                        </div>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

                          <div className="flex items-center gap-2 text-sm text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            تم تأكيد هذا الحجز
                          </div>

                  <form action={updateBookingStatus}>
                            <input
                              type="hidden"
                              name="bookingId"
                              value={booking.id}
                            />

                            <input
                              type="hidden"
                              name="status"
                              value="CANCELLED"
                            />

                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
                            >
                              <XCircle className="h-4 w-4" />
                              إلغاء
                            </button>
                          </form>

                        </div>
                      )}

                    </div>
                  </div>

                </article>
              );
            })}

          </section>
        )}

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "cyan",
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
  tone?: "cyan" | "amber" | "green" | "blue" | "red";
}) {
  const tones = {
    cyan: {
      icon: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    amber: {
      icon: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    green: {
      icon: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    blue: {
      icon: "text-sky-400",
      bg: "bg-sky-400/10",
    },
    red: {
      icon: "text-red-400",
      bg: "bg-red-400/10",
    },
  };

  const current = tones[tone];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.bg}`}
      >
        <Icon
          className={`h-5 w-5 ${current.icon}`}
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}