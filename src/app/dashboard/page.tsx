import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCommunitiesForUser,
  getPriceQuotes,
  getProducts,
} from "@/server/queries";

export default async function DashboardHomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [communities, products, prices] = await Promise.all([
    getCommunitiesForUser(session),
    getProducts(),
    getPriceQuotes(session),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Panel de agentes
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Bienvenido, {session.name}
        </h2>

        <p className="mt-2 max-w-2xl text-slate-400">
          Desde aquí puedes gestionar comunidades, productos agrícolas y
          precios reportados para la comunidad.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Comunidades visibles</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {communities.length}
          </p>

          <Link
            href="/dashboard/communities"
            className="mt-4 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Ver comunidades
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Productos registrados</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {products.length}
          </p>

          <Link
            href="/dashboard/products"
            className="mt-4 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Ver productos
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Precios recientes</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {prices.length}
          </p>

          <Link
            href="/dashboard/prices"
            className="mt-4 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Ver precios
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Módulos activos en Fase 3A
        </h3>

        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li>- Comunidades y membresías visibles.</li>
          <li>- Catálogo de productos agrícolas.</li>
          <li>- Registro y consulta de precios agrícolas.</li>
        </ul>
      </div>
    </div>
  );
}
