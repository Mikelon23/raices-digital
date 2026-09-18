import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/layout/logout-button";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-8 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-400">
                Administración
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white">
                Panel de administrador
              </h1>

              <p className="mt-2 text-slate-400">
                Esta sección solo puede ser vista por usuarios con rol ADMIN.
              </p>
            </div>

            <LogoutButton />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="font-semibold text-white">Usuarios</h2>
              <p className="mt-2 text-sm text-slate-400">
                Aquí gestionaremos usuarios, roles y accesos.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="font-semibold text-white">Comunidades</h2>
              <p className="mt-2 text-sm text-slate-400">
                Aquí gestionaremos comunidades piloto y membresías.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="font-semibold text-white">Auditoría</h2>
              <p className="mt-2 text-sm text-slate-400">
                Aquí revisaremos cambios importantes del sistema.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Volver al dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}