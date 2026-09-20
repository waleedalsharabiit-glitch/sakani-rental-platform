import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowLeft,
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

export default async function MyBookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
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
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-bold text-sky-400">
            حسابي
          </p>

          <h1 className="mt-2 text-3xl font-black">
            حجوزاتي
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            جميع طلبات الحجز الخاصة بك.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-center">
            <CalendarDays className="h-12 w-12 text-slate-700" />

            <h2 className="mt-5 text-xl font-bold">
              لا توجد حجوزات
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              لم تقم بإرسال أي طلب حجز حتى الآن.
            </p>

            <Link
              href="/properties"
              className="mt-6 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold"
            >
              استكشف العقارات
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const status =
                statusMap[booking.status];

              const image =
                booking.property.images[0];

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative h-56 md:h-auto md:w-64">
                      {image ? (
                        <img
                          src={image.url}
                          alt={booking.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-800 text-slate-600">
                          لا توجد صورة
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span className="text-xs font-bold text-sky-400">
                            {booking.property.category.name}
                          </span>

                          <h2 className="mt-2 text-xl font-black">
                            {booking.property.title}
                          </h2>

                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="h-4 w-4 text-sky-400" />
                            {booking.property.city}
                          </div>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-600">
                            الوصول
                          </p>

                          <p className="mt-1 text-sm font-bold">
                            {booking.startDate.toLocaleDateString(
                              "ar-YE"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            المغادرة
                          </p>

                          <p className="mt-1 text-sm font-bold">
                            {booking.endDate.toLocaleDateString(
                              "ar-YE"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            الإجمالي
                          </p>

                          <p className="mt-1 text-sm font-black text-sky-400">
                            {booking.totalPrice.toLocaleString(
                              "ar-YE"
                            )}{" "}
                            ريال
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Link
                          href={`/properties/${booking.property.id}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-sky-400 transition hover:text-sky-300"
                        >
                          عرض العقار
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}