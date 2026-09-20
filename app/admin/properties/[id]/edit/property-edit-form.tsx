"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProperty } from "@/actions/properties";

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type PropertyData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  ownerId: string;
  categoryId: string;
};

type Props = {
  property: PropertyData;
  users: UserOption[];
  categories: CategoryOption[];
};

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export default function PropertyEditForm({
  property,
  users,
  categories,
}: Props) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateProperty,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin/properties");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <input
        type="hidden"
        name="id"
        value={property.id}
      />

      {/* البيانات الأساسية */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold">
            البيانات الأساسية
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            المعلومات الأساسية للعقار.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* العنوان */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              اسم العقار
            </label>

            <input
              name="title"
              defaultValue={property.title}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              الرابط
            </label>

            <input
              name="slug"
              defaultValue={property.slug}
              dir="ltr"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left outline-none transition focus:border-cyan-500"
            />

            <p className="mt-1 text-xs text-slate-500">
              مثال: luxury-apartment-airport
            </p>
          </div>

          {/* السعر */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              السعر
            </label>

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={property.price}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* المدينة */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              المدينة
            </label>

            <input
              name="city"
              defaultValue={property.city}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* العنوان */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              العنوان التفصيلي
            </label>

            <input
              name="address"
              defaultValue={property.address}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* التصنيف */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              التصنيف
            </label>

            <select
              name="categoryId"
              defaultValue={property.categoryId}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
            >
              <option value="">
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
          </div>

          {/* المالك */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              المالك
            </label>

            <select
              name="ownerId"
              defaultValue={property.ownerId}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
            >
              <option value="">
                اختر المالك
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

      {/* الوصف */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-bold">
          وصف العقار
        </h2>

        <textarea
          name="description"
          defaultValue={property.description}
          rows={6}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
          placeholder="اكتب وصفًا واضحًا للعقار..."
        />
      </section>

      {/* الموقع */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            الموقع الجغرافي
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            اختياري. سيتم استخدامه لاحقًا لعرض العقار على الخريطة.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Latitude
            </label>

            <input
              name="latitude"
              type="number"
              step="any"
              defaultValue={property.latitude ?? ""}
              dir="ltr"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Longitude
            </label>

            <input
              name="longitude"
              type="number"
              step="any"
              defaultValue={property.longitude ?? ""}
              dir="ltr"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* الرسالة */}
      {state.message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* الأزرار */}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/properties")}
          className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}