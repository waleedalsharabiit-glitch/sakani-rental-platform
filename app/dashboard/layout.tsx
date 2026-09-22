import { redirect } from "next/navigation";

import { auth } from "@/auth";
import DashboardSidebar from "./dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#020617] text-white"
    >
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.05),transparent_35%)]" />
      </div>

      <DashboardSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
      />

      {/* Main Content */}
      <main className="min-h-screen lg:mr-72">
        {/* Mobile top spacing */}
        <div className="h-20 lg:hidden" />

        <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}