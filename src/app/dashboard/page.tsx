export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10">
          <p className="text-sm uppercase tracking-widest text-emerald-400">
            Panel
          </p>

          <h1 className="mt-4 text-3xl font-bold text-white">
            Dashboard de Raíces Digital
          </h1>

          <p className="mt-4 text-slate-300">
            Esta sección será el panel de agentes comunitarios.
            Aquí se gestionarán precios, salud comunitaria, mercado local
            y bitácora de actividades.
          </p>
        </div>
      </div>
    </main>
  );
}