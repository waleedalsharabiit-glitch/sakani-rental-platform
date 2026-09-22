"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ExternalLink,
  Loader2,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteReview,
  updateReview,
} from "@/actions/reviews";

type ReviewItemProps = {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    propertyId: string;
    property: {
      id: string;
      title: string;
      city: string;
      category: string;
      image: string | null;
    };
  };
};

export default function ReviewItem({
  review,
}: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(
    review.comment ?? "",
  );

  const [message, setMessage] = useState("");
  const [isPending, startTransition] =
    useTransition();

  function handleUpdate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      setMessage("اختر تقييمًا من 1 إلى 5 نجوم.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();

      formData.set("reviewId", review.id);
      formData.set(
        "propertyId",
        review.propertyId,
      );
      formData.set("rating", String(rating));
      formData.set("comment", comment);

      const result = await updateReview(
        {
          success: false,
          message: "",
        },
        formData,
      );

      setMessage(result.message);

      if (result.success) {
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا التقييم؟",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteReview(
        review.id,
        review.propertyId,
      );

      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10">

      {/* Property */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row">

        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-800 sm:h-28 sm:w-44">
          {review.property.image ? (
            <img
              src={review.property.image}
              alt={review.property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              لا توجد صورة
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <Link
                href={`/properties/${review.property.id}`}
                className="group inline-flex items-center gap-2 text-lg font-black transition hover:text-sky-400"
              >
                <span className="truncate">
                  {review.property.title}
                </span>

                <ExternalLink className="h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100" />
              </Link>

              <p className="mt-1 text-xs text-slate-500">
                {review.property.city} ·{" "}
                {review.property.category}
              </p>
            </div>

            <span className="shrink-0 text-xs text-slate-600">
              {new Date(
                review.createdAt,
              ).toLocaleDateString("ar-YE")}
            </span>

          </div>

          {/* Stars */}
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <Star
                  key={index}
                  className={`h-5 w-5 ${
                    index < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-700"
                  }`}
                />
              ),
            )}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="mt-4 rounded-2xl bg-black/20 p-4 text-sm leading-7 text-slate-400">
              {review.comment}
            </p>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setIsEditing(true);
              }}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-bold text-slate-300 transition hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300 disabled:opacity-50"
            >
              <Pencil className="h-4 w-4" />
              تعديل التقييم
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 px-4 text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}

              حذف التقييم
            </button>

          </div>

          {message && !isEditing && (
            <p className="mt-3 text-xs text-slate-400">
              {message}
            </p>
          )}

        </div>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div className="border-t border-white/10 bg-black/20 p-5">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-black">
                تعديل تقييمك
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                يمكنك تعديل التقييم والتعليق.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={handleUpdate}
            className="space-y-5"
          >

            {/* Rating */}
            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">
                تقييمك
              </p>

              <div className="flex gap-1">
                {Array.from({ length: 5 }).map(
                  (_, index) => {
                    const value = index + 1;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setRating(value)
                        }
                        className="rounded-lg p-1 transition hover:bg-white/5"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            value <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-700"
                          }`}
                        />
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor={`comment-${review.id}`}
                className="mb-2 block text-sm font-bold text-slate-300"
              >
                تعليقك
              </label>

              <textarea
                id={`comment-${review.id}`}
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                maxLength={1000}
                rows={4}
                placeholder="اكتب تجربتك مع العقار..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/50"
              />

              <p className="mt-2 text-left text-[11px] text-slate-600">
                {comment.length}/1000
              </p>
            </div>

            {message && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-sky-500 to-blue-600 px-6 text-sm font-black text-white transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              حفظ التعديلات
            </button>

          </form>
        </div>
      )}

    </article>
  );
}