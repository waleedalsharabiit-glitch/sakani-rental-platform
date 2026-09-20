"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: false,
  message: "",
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10"
    >
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">إنشاء حساب</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            أنشئ حسابك وابدأ باستخدام منصة سَكَني
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              الاسم
            </label>

            <Input
              id="name"
              name="name"
              type="text"
              placeholder="أدخل اسمك"
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              البريد الإلكتروني
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
              autoComplete="email"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              كلمة المرور
            </label>

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8 أحرف على الأقل"
              required
              minLength={8}
              autoComplete="new-password"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              تأكيد كلمة المرور
            </label>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="أعد كتابة كلمة المرور"
              required
              minLength={8}
              autoComplete="new-password"
              dir="ltr"
            />
          </div>

          {state.message && (
            <div
              role="alert"
              className={
                state.success
                  ? "rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                  : "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              }
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </main>
  );
}