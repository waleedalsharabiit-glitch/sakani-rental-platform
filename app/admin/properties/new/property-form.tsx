"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/actions/properties";

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type PropertyFormProps = {
  users: UserOption[];
  categories: CategoryOption[];
};

type PropertyActionState = {
  success: boolean;
  message: string;
};

const initialState: PropertyActionState = {
  success: false,
  message: "",
};

export function PropertyForm({
  users,
  categories,
}: PropertyFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createProperty,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin/properties");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">

      {/* General Information */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-bold text-white">
            المعلومات الأساسية
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            المعلومات الرئيسية التي ستظهر للمستخدمين.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">

          {/* Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              اسم العقار
            </label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="مثال: شقة فاخرة في شارع المطار"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Slug */}
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
              type="text"
              placeholder="luxury-apartment-airport"
              required
              dir="ltr"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />

            <p className="mt-2 text-xs text-slate-500">
              استخدم الأحرف الإنجليزية الصغيرة والأرقام والشرطة فقط.
            </p>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              السعر
            </label>

            <div className="relative">
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="500"
                required
                dir="ltr"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pl-16 text-left text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                ريال
              </span>
            </div>
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              المدينة
            </label>

            <input
              id="city"
              name="city"
              type="text"
              placeholder="عدن"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              العنوان
            </label>

            <input
              id="address"
              name="address"
              type="text"
              placeholder="شارع المطار، بجانب..."
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              تصنيف العقار
            </label>

            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue=""
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="" disabled>
                اختر التصنيف
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {categories.length === 0 && (
              <p className="mt-2 text-xs text-amber-400">
                لا توجد تصنيفات حاليًا. أضف تصنيفًا أولًا من قسم التصنيفات.
              </p>
            )}
          </div>

          {/* Owner */}
          <div>
            <label
              htmlFor="ownerId"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              مالك العقار
            </label>

            <select
              id="ownerId"
              name="ownerId"
              required
              defaultValue=""
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="" disabled>
                اختر مالك العقار
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-bold text-white">
            وصف العقار
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            أضف وصفًا واضحًا ومفيدًا للعقار.
          </p>
        </div>

        <div className="p-6">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            الوصف
          </label>

          <textarea
            id="description"
            name="description"
            rows={7}
            placeholder="اكتب تفاصيل العقار، المميزات، الموقع، والخدمات المتوفرة..."
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      </section>

      {/* Location */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-bold text-white">
            الموقع الجغرافي
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            الإحداثيات اختيارية ويمكن استخدامها لاحقًا لعرض العقار على الخريطة.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">

          {/* Latitude */}
          <div>
            <label
              htmlFor="latitude"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              خط العرض Latitude
            </label>

            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="12.7855"
              dir="ltr"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Longitude */}
          <div>
            <label
              htmlFor="longitude"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              خط الطول Longitude
            </label>

            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="45.0187"
              dir="ltr"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>
      </section>

      {/* Error / Success */}
      {state.message && !state.success && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {state.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          إلغاء
        </button>

        <button
          type="submit"
          disabled={isPending || categories.length === 0}
          className="rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "جاري إضافة العقار..." : "إضافة العقار"}
        </button>

      </div>

    </form>
  );
}