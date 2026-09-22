"use client";

import { useActionState, useState } from "react";
import { Loader2, Send, Star } from "lucide-react";

import { createReview } from "@/actions/reviews";
import { initialReviewState } from "@/lib/review-state";

type ReviewFormProps = {
  propertyId: string;
};

export function ReviewForm({
  propertyId,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);

  const [state, formAction, pending] = useActionState(
    createReview,
    initialReviewState
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-black text-white">
          أضف تقييمك
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          شارك تجربتك مع هذا العقار.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <input
          type="hidden"
          name="propertyId"
          value={propertyId}
        />

        {/* Rating */}
        <div>
          <p className="mb-3 text-sm font-bold text-white">
            تقييمك
          </p>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`تقييم ${value} من 5`}
                onClick={() => setRating(value)}
                className="transition hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 ${
                    value <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>

          <input
            type="hidden"
            name="rating"
            value={rating}
          />
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="review-comment"
            className="mb-2 block text-sm font-bold text-white"
          >
            تعليقك
          </label>

          <textarea
            id="review-comment"
            name="comment"
            rows={4}
            maxLength={1000}
            placeholder="اكتب تجربتك مع العقار..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-cyan-400 to-blue-500 font-bold text-slate-950 transition hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جارٍ إرسال التقييم...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              إرسال التقييم
            </>
          )}
        </button>

        {/* Message */}
        {state.message && (
          <div
            className={`rounded-2xl border p-4 text-sm leading-7 ${
              state.success
                ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                : "border-red-400/20 bg-red-400/5 text-red-300"
            }`}
          >
            {state.message}
          </div>
        )}
      </form>
    </div>
  );
}