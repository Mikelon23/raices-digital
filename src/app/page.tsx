import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-emerald-400">
            MVP local
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Raíces Digital
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Plataforma híbrida para comunidades rurales y periurbanas.
            Conecta agentes comunitarios, información de salud básica,
            precios agrícolas y mercado local.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="text-lg font-semibold text-emerald-300">
                Salud comunitaria
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Directorio de centros de salud y referencias básicas.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="text-lg font-semibold text-emerald-300">
                Precios agrícolas
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Consulta y registro de precios locales de productos.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="text-lg font-semibold text-emerald-300">
                Mercado local
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Compra y venta simple entre productores y compradores.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/api/health"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Ver estado del sistema
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Ir al panel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}