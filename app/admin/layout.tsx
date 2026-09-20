import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <div className="min-h-screen lg:mr-72">
        {children}
      </div>
    </div>
  );
}