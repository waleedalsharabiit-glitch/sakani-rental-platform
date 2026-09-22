import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteUser,
  updateUserRole,
} from "@/actions/users";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          properties: true,
          bookings: true,
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-slate-400 transition hover:text-cyan-400"
            >
              ← العودة إلى لوحة التحكم
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              إدارة المستخدمين
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              إدارة حسابات المستخدمين والصلاحيات داخل منصة سَكَني.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-5 py-4">
            <p className="text-xs text-slate-500">
              إجمالي المستخدمين
            </p>

            <p className="mt-1 text-2xl font-bold text-cyan-400">
              {users.length}
            </p>
          </div>
        </div>

        {/* Users table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">

          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-bold text-white">
              جميع المستخدمين
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              يمكنك تعديل صلاحيات الحسابات أو حذف المستخدمين.
            </p>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">👥</div>

              <h3 className="mt-4 text-lg font-bold">
                لا يوجد مستخدمون
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                لم يتم تسجيل أي مستخدم حتى الآن.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-right">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-xs font-semibold text-slate-400">
                    <th className="px-6 py-4">
                      المستخدم
                    </th>

                    <th className="px-6 py-4">
                      الهاتف
                    </th>

                    <th className="px-6 py-4">
                      الصلاحية
                    </th>

                    <th className="px-6 py-4">
                      النشاط
                    </th>

                    <th className="px-6 py-4">
                      تاريخ التسجيل
                    </th>

                    <th className="px-6 py-4">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {users.map((user) => {
                    const isCurrentUser =
                      user.id === session.user.id;

                    return (
                      <tr
                        key={user.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-sm font-bold text-cyan-300">
                              {(user.name?.charAt(0) ??
                                user.email.charAt(0))
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-white">
                                {user.name || "بدون اسم"}
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1 truncate text-xs text-slate-500"
                              >
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-5 text-sm text-slate-400">
                          {user.phone || "—"}
                        </td>

                        {/* Role */}
<td className="px-6 py-5">
  <form
    action={updateUserRole}
    className="flex items-center gap-2"
  >
    <input
      type="hidden"
      name="userId"
      value={user.id}
    />

    <select
      name="role"
      defaultValue={user.role}
      disabled={isCurrentUser}
      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="USER">
        مستخدم
      </option>

      <option value="ADMIN">
        مدير
      </option>
    </select>

    {!isCurrentUser && (
      <button
        type="submit"
        className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
      >
        حفظ
      </button>
    )}
  </form>
</td>

                        {/* Activity */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-lg bg-blue-400/10 px-2.5 py-1 text-blue-300">
                              حجوزات: {user._count.bookings}
                            </span>

                            <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-cyan-300">
                              عقارات: {user._count.properties}
                            </span>

                            <span className="rounded-lg bg-yellow-400/10 px-2.5 py-1 text-yellow-300">
                              تقييمات: {user._count.reviews}
                            </span>
                          </div>
                        </td>

                        {/* Created */}
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {new Intl.DateTimeFormat("ar-YE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          {isCurrentUser ? (
                            <span className="text-xs font-medium text-slate-600">
                              حسابك الحالي
                            </span>
                          ) : (
                           <form action={deleteUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />

                              <button
                                type="submit"
                                className="rounded-xl border border-red-400/10 bg-red-400/5 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
                              >
                                حذف المستخدم
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}