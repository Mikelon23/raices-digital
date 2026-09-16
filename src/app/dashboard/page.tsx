import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/layout/logout-button";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-400">
                Panel
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white">
                Hola, {session.name}
              </h1>

              <p className="mt-2 text-slate-400">
                Has iniciado sesión correctamente en Raíces Digital.
              </p>
            </div>

            <LogoutButton />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Correo</p>
              <p className="mt-1 font-semibold text-white">
                {session.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Rol</p>
              <p className="mt-1 font-semibold text-emerald-300">
                {session.role}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Estado</p>
              <p className="mt-1 font-semibold text-white">
                Sesión activa
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <h2 className="text-lg font-semibold text-white">
                Módulos próximos
              </h2>

              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>- Registro de precios agrícolas.</li>
                <li>- Directorio de salud comunitaria.</li>
                <li>- Referencias básicas de salud.</li>
                <li>- Mercado local.</li>
                <li>- Bitácora del agente comunitario.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <h2 className="text-lg font-semibold text-white">
                Acciones rápidas
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Ir al inicio
                </Link>

                {session.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Ir al panel admin
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
