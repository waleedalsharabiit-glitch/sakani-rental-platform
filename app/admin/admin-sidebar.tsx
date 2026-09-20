"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  Home,
  LogOut,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    title: "الرئيسية",
    href: "/admin",
    icon: Home,
  },
  {
    title: "العقارات",
    href: "/admin/properties",
    icon: Building2,
  },
  {
    title: "المستخدمون",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "الحجوزات",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "التصنيفات",
    href: "/admin/categories",
    icon: Tags,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 right-0 z-50 hidden w-72 border-l border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-xl font-bold shadow-lg shadow-cyan-500/20">
            س
          </div>

          <div>
            <h1 className="text-lg font-bold">سَكَني</h1>

            <p className="text-xs text-slate-400">
              لوحة الإدارة
            </p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold text-slate-500">
          القائمة الرئيسية
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />

                <span>{item.title}</span>
              </div>

              {isActive && (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Link>
          );
        })}

        <div className="my-5 border-t border-white/10" />

        <p className="mb-3 px-3 text-xs font-semibold text-slate-500">
          النظام
        </p>

        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          الإعدادات
        </Link>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}