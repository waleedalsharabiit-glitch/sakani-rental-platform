
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-5 text-sm font-bold text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-400/20 hover:text-rose-200"
    >
      <LogOut className="h-4 w-4" />
      تسجيل الخروج
    </button>
  );
}

