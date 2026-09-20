import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { CategoryForm } from "./category-form";
import { DeleteCategoryButton } from "./delete-category-button";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          properties: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              التصنيفات
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              إدارة تصنيفات العقارات في منصة سَكَني.
            </p>
          </div>

          <Link
            href="/admin/properties"
            className="w-fit rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            ← العقارات
          </Link>
        </div>

        {/* Add */}
        <CategoryForm />

        {/* List */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  قائمة التصنيفات
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  إجمالي التصنيفات: {categories.length}
                </p>
              </div>

              <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
                {categories.length} تصنيف
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                📂
              </div>

              <h3 className="text-lg font-bold">
                لا توجد تصنيفات
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                أضف أول تصنيف لاستخدامه عند إنشاء العقارات.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-5 px-6 py-5 transition hover:bg-slate-800/40 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-white">
                      {category.name}
                    </h3>

                    <p
                      dir="ltr"
                      className="mt-1 text-left text-xs text-slate-500"
                    >
                      /{category.slug}
                    </p>

                    {category.description && (
                      <p className="mt-2 text-sm text-slate-400">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
                      {category._count.properties} عقار
                    </div>

                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                    >
                      تعديل
                    </Link>

                    <DeleteCategoryButton
                      id={category.id}
                      name={category.name}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}