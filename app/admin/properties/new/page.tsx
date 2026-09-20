import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "./property-form";

export default async function NewPropertyPage() {
  const [users, categories] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Link
                href="/admin/properties"
                className="transition hover:text-cyan-400"
              >
                العقارات
              </Link>

              <span>/</span>

              <span className="text-slate-500">
                إضافة عقار
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              إضافة عقار جديد
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              أضف عقارًا جديدًا إلى منصة سَكَني.
            </p>
          </div>

          <Link
            href="/admin/properties"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            <span>←</span>
            العودة للعقارات
          </Link>
        </div>

        {/* Form */}
        <PropertyForm
          users={users}
          categories={categories}
        />

      </div>
    </main>
  );
}