"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { createBooking } from "@/actions/bookings";
const initialBookingState = {
  success: false,
  message: "",
};
type BookingFormProps = {
  propertyId: string;
  price: number;
  isLoggedIn: boolean;
};

export function BookingForm({
  propertyId,
  price,
  isLoggedIn,
}: BookingFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialBookingState
  );

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const start = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T00:00:00`
    );

    const difference =
      end.getTime() - start.getTime();

    if (difference <= 0) return 0;

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  }, [startDate, endDate]);

  const total = nights * price;

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-5">
      {!isLoggedIn ? (
        <>
          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/5 p-4">
            <div className="flex gap-3">
              <LogIn className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <div>
                <p className="text-sm font-bold text-amber-300">
                  تسجيل الدخول مطلوب
                </p>

                <p className="mt-1 text-xs leading-6 text-slate-500">
                  سجل الدخول حتى تتمكن من إرسال طلب حجز لهذا العقار.
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/login?callbackUrl=/properties/${propertyId}`}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 font-black text-white transition hover:from-sky-400 hover:to-blue-500"
          >
            <LogIn className="h-5 w-5" />
            تسجيل الدخول للحجز
          </Link>
        </>
      ) : (
        <form action={formAction} className="space-y-5">
          <input
            type="hidden"
            name="propertyId"
            value={propertyId}
          />

          {/* Dates */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-bold"
              >
                تاريخ الوصول
              </label>

              <div className="relative">
                <CalendarDays className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-400" />

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  required
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950 pr-12 pl-4 text-sm text-white outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-bold"
              >
                تاريخ المغادرة
              </label>

              <div className="relative">
                <CalendarDays className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-400" />

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  required
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950 pr-12 pl-4 text-sm text-white outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10"
                />
              </div>
            </div>
          </div>

          {/* Price calculation */}
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                سعر الليلة
              </span>

              <span className="font-bold">
                {price.toLocaleString("ar-YE")} ريال
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">
                عدد الليالي
              </span>

              <span className="font-bold">
                {nights || "—"}
              </span>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  الإجمالي
                </span>

                <span className="text-2xl font-black text-sky-400">
                  {total
                    ? total.toLocaleString("ar-YE")
                    : "—"}
                  <span className="mr-1 text-xs text-slate-500">
                    ريال
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              pending ||
              !startDate ||
              !endDate ||
              nights <= 0
            }
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 font-black text-white shadow-lg shadow-blue-950/30 transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جارٍ إرسال الطلب...
              </>
            ) : (
              <>
                <CalendarDays className="h-5 w-5" />
                إرسال طلب الحجز
              </>
            )}
          </button>

          {/* Result */}
          {state.message && (
            <div
              className={`rounded-2xl border p-4 text-sm leading-7 ${
                state.success
                  ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                  : "border-red-400/20 bg-red-400/5 text-red-300"
              }`}
            >
              <div className="flex gap-3">
                {state.success ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" />
                ) : null}

                <span>{state.message}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 border-t border-white/10 pt-5 text-xs leading-6 text-slate-500">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />

            <span>
              يتم إنشاء طلب الحجز بحالة «قيد الانتظار»
              حتى يتم تأكيده من الإدارة.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}