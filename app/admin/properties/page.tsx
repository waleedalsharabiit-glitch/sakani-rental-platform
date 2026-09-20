import Link from "next/link";
import DeletePropertyButton from "./delete-property-button";
import {
  Building2,
  ChevronLeft,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-5 py-6 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Building2 className="h-4 w-4 text-cyan-400" />
              إدارة المنصة
              <ChevronLeft className="h-4 w-4" />
              العقارات
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              العقارات
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              إدارة جميع العقارات الموجودة في منصة سَكَني.
            </p>
          </div>

          <Link
            href="/admin/properties/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
          >
            <Plus className="h-4 w-4" />
            إضافة عقار
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <InfoCard
            title="إجمالي العقارات"
            value={properties.length}
          />

          <InfoCard
            title="إجمالي الحجوزات"
            value={properties.reduce(
              (total, property) =>
                total + property._count.bookings,
              0
            )}
          />

          <InfoCard
            title="إجمالي التقييمات"
            value={properties.reduce(
              (total, property) =>
                total + property._count.reviews,
              0
            )}
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-bold text-white">
              قائمة العقارات
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              آخر العقارات المضافة تظهر أولًا.
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-600" />

              <h3 className="mt-4 font-bold text-slate-300">
                لا توجد عقارات حتى الآن
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                أضف أول عقار إلى المنصة للبدء.
              </p>

              <Link
                href="/admin/properties/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500"
              >
                <Plus className="h-4 w-4" />
                إضافة عقار
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-right text-sm">
                <thead className="bg-slate-950/70 text-xs text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      العقار
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      التصنيف
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      المدينة
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      السعر
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      الحجوزات
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      className="transition hover:bg-slate-800/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 text-cyan-400">
                            <Building2 className="h-5 w-5" />
                          </div>

                          <div className="max-w-[240px]">
                            <p className="truncate font-bold text-white">
                              {property.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {property.owner.name ??
                                property.owner.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400">
                          {property.category.name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          {property.city}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-bold text-cyan-400">
                        {property.price.toLocaleString("ar-YE")} ريال
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {property._count.bookings}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                         <Link
  href={`/admin/properties/${property.id}/edit`}
  title="تعديل العقار"
  className="rounded-lg p-2 text-cyan-400 transition hover:bg-cyan-500/10 hover:text-cyan-300"
>
  ✏️
</Link>

                          <DeletePropertyButton propertyId={property.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-2 text-3xl font-black text-white">
        {value.toLocaleString("ar-YE")}
      </p>
    </div>
  );
}