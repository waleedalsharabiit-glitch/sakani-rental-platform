import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { EditCategoryForm } from "./edit-category-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: Props) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="text-sm text-slate-400 transition hover:text-cyan-400"
          >
            ← العودة للتصنيفات
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            تعديل التصنيف
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            تعديل بيانات تصنيف {category.name}
          </p>
        </div>

        <EditCategoryForm category={category} />

      </div>
    </main>
  );
}