"use client";

import { useActionState } from "react";
import Link from "next/link";

import { updateCategory } from "@/actions/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Props = {
  category: Category;
};

type CategoryActionState = {
  success: boolean;
  message: string;
};

const initialState: CategoryActionState = {
  success: false,
  message: "",
};

export function EditCategoryForm({ category }: Props) {
  const updateCategoryWithId = updateCategory.bind(null, category.id);

  const [state, formAction, isPending] = useActionState(
    updateCategoryWithId,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl sm:p-8"
    >
      {/* الاسم */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          اسم التصنيف
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={category.name}
          required
          placeholder="مثال: شقق سكنية"
          className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          الرابط المختصر
        </label>

        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={category.slug}
          required
          placeholder="مثال: apartments"
          dir="ltr"
          className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
        />

        <p className="mt-2 text-xs text-slate-500">
          يستخدم الرابط المختصر للتعرف على التصنيف داخل الموقع.
        </p>
      </div>

      {/* الوصف */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          الوصف
        </label>

        <textarea
          id="description"
          name="description"
          defaultValue={category.description ?? ""}
          rows={5}
          placeholder="اكتب وصفًا مختصرًا للتصنيف..."
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
        />
      </div>

      {/* رسالة العملية */}
      {state.message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            state.success
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* الأزرار */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/categories"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          إلغاء
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 px-7 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}