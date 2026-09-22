import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          favorites: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const memberSince = new Intl.DateTimeFormat("ar-YE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(user.createdAt);

  const roleLabel =
    user.role === "ADMIN" ? "مدير النظام" : "مستخدم";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-sky-400">
              حسابك في سَكَني
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              الملف الشخصي
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              عرض معلومات حسابك وإحصائيات استخدامك لمنصة سَكَني.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-slate-300 transition hover:border-sky-500/30 hover:bg-white/[0.07] hover:text-white"
          >
            العودة للوحة التحكم
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Profile */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20">
          <div className="relative border-b border-white/10 bg-gradient-to-l from-sky-500/10 via-blue-500/5 to-transparent p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-500/20 to-blue-600/10 shadow-lg shadow-sky-500/5">
                {user.name ? (
                  <span className="text-3xl font-black text-sky-300">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-10 w-10 text-sky-300" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black">
                    {user.name || "مستخدم سَكَني"}
                  </h2>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {roleLabel}
                  </span>
                </div>

                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <CalendarDays className="h-4 w-4" />
                  عضو منذ {memberSince}
                </p>
              </div>
            </div>
          </div>

          {/* Account information */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold text-slate-500">
                الاسم
              </p>

              <p className="mt-2 text-base font-bold text-white">
                {user.name || "غير محدد"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold text-slate-500">
                البريد الإلكتروني
              </p>

              <p className="mt-2 break-all text-base font-bold text-white">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold text-slate-500">
                رقم الهاتف
              </p>

              <p className="mt-2 text-base font-bold text-white">
                {user.phone || "غير مضاف"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold text-slate-500">
                نوع الحساب
              </p>

              <p className="mt-2 text-base font-bold text-white">
                {roleLabel}
              </p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-black">
              نشاط الحساب
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ملخص استخدامك لمنصة سَكَني.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    الحجوزات
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {user._count.bookings}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10">
                  <CalendarDays className="h-6 w-6 text-sky-400" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    المفضلة
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {user._count.favorites}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/10">
                  <CheckCircle2 className="h-6 w-6 text-rose-400" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    التقييمات
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {user._count.reviews}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10">
                  <ShieldCheck className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-xl font-black">
            الوصول السريع
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            انتقل إلى الأقسام المرتبطة بحسابك.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/bookings"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-l from-sky-500 to-blue-600 px-5 text-sm font-black text-white transition hover:from-sky-400 hover:to-blue-500"
            >
              حجوزاتي
            </Link>

            <Link
              href="/dashboard/favorites"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              المفضلة
            </Link>

            <Link
              href="/dashboard/reviews"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              تقييماتي
            </Link>

            <Link
              href="/properties"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              استكشاف العقارات
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

