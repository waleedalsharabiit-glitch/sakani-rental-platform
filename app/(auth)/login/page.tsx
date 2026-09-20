"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsPending(false);

    if (!result || result.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10"
    >
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            تسجيل الدخول
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            سجّل الدخول إلى حسابك في منصة سَكَني
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              البريد الإلكتروني
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              dir="ltr"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
    </main>
  );
}