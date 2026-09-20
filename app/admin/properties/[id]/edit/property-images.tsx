"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  deletePropertyImage,
  uploadPropertyImage,
} from "@/actions/property-images";

type PropertyImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type Props = {
  propertyId: string;
  images: PropertyImage[];
};

export default function PropertyImages({
  propertyId,
  images,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [pending, startTransition] = useTransition();

  const [message, setMessage] = useState("");

  function handleUpload() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setMessage("اختر صورة أولًا");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadPropertyImage(
        propertyId,
        formData
      );

      setMessage(result.message);

      if (result.success && inputRef.current) {
        inputRef.current.value = "";
      }

      if (result.success) {
        window.location.reload();
      }
    });
  }

  function handleDelete(imageId: string) {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذه الصورة؟"
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePropertyImage(
        imageId
      );

      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold">
          صور العقار
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          أضف صورًا واضحة للعقار ليتمكن المستأجر من
          معاينته قبل الحجز.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-cyan-400"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={pending}
          className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-bold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
        >
          {pending ? "جاري الرفع..." : "رفع الصورة"}
        </button>

        <p className="mt-3 text-xs text-slate-500">
          PNG / JPG / WEBP — الحد الأقصى 5MB
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
          {message}
        </div>
      )}

      {images.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 py-12 text-center">
          <div className="text-4xl">🖼️</div>

          <p className="mt-3 font-semibold text-slate-300">
            لا توجد صور لهذا العقار
          </p>

          <p className="mt-1 text-sm text-slate-500">
            ارفع أول صورة باستخدام النموذج أعلاه.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.url}
                  alt={image.alt || "صورة العقار"}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                {index === 0 && (
                  <div className="absolute right-3 top-3 rounded-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    الصورة الرئيسية
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-slate-500">
                  صورة #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(image.id)
                  }
                  disabled={pending}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}