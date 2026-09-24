import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/layout/dashboard-nav";
import LogoutButton from "@/components/layout/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400">
              Raíces Digital
            </p>

            <h1 className="mt-1 text-xl font-semibold text-white">
              {session.name}
            </h1>

            <p className="text-sm text-slate-400">
              {session.email} · {session.role}
            </p>
          </div>

          <LogoutButton />
        </div>

        <DashboardNav role={session.role} />
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </main>
  );
}
