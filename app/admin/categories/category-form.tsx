"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { createCategory } from "@/actions/categories";

const initialState = {
  success: false,
  message: "",
};

export function CategoryForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createCategory,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-lg font-bold">
          إضافة تصنيف جديد
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          أضف تصنيفًا جديدًا للعقارات.
        </p>
      </div>

      <form
        action={formAction}
        className="grid gap-5 p-6 md:grid-cols-2"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            اسم التصنيف
          </label>

          <input
            id="name"
            name="name"
            required
            placeholder="مثال: شقق"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            الرابط المختصر
          </label>

          <input
            id="slug"
            name="slug"
            required
            dir="ltr"
            placeholder="apartments"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            الوصف
          </label>

          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="وصف مختصر للتصنيف..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {state.message && (
          <div
            className={`md:col-span-2 rounded-xl px-4 py-3 text-sm ${
              state.success
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 px-7 py-3 font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "جاري الإضافة..." : "إضافة التصنيف"}
          </button>
        </div>
      </form>
    </section>
  );
}