import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getHealthFacilities, getHealthReferrals } from "@/server/queries-health";

export default async function HealthPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [facilities, referrals] = await Promise.all([
    getHealthFacilities(session),
    getHealthReferrals(session),
  ]);

  const openReferrals = referrals.filter((r) => r.status === "OPEN").length;
  const urgentReferrals = referrals.filter((r) => r.status === "URGENT").length;
  const attendedReferrals = referrals.filter((r) => r.status === "ATTENDED").length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Salud comunitaria
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Módulo de salud
        </h2>

        <p className="mt-2 text-slate-400">
          Gestiona centros de salud locales y referencias básicas para la comunidad.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Centros de salud</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {facilities.length}
          </p>

          <Link
            href="/dashboard/health/facilities"
            className="mt-4 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Ver centros
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Referencias abiertas</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {openReferrals}
          </p>

          <Link
            href="/dashboard/health/referrals"
            className="mt-4 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Ver referencias
          </Link>
        </div>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-300">Urgentes</p>
          <p className="mt-2 text-4xl font-bold text-red-200">
            {urgentReferrals}
          </p>

          <Link
            href="/dashboard/health/referrals"
            className="mt-4 inline-block text-sm font-semibold text-red-300 hover:text-red-200"
          >
            Ver urgentes
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Atendidas</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {attendedReferrals}
          </p>

          <Link
            href="/dashboard/health/referrals"
            className="mt-4 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Ver atendidas
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Centros de salud recientes
          </h3>

          {facilities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No hay centros de salud registrados.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {facilities.slice(0, 5).map((facility) => (
                <li
                  key={facility.id}
                  className="rounded-xl bg-slate-950/60 p-3 text-sm text-slate-300"
                >
                  <p className="font-medium text-white">{facility.name}</p>
                  <p className="text-xs text-slate-500">
                    {facility.type} · {facility.community.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Referencias recientes
          </h3>

          {referrals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No hay referencias registradas.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {referrals.slice(0, 5).map((referral) => (
                <li
                  key={referral.id}
                  className="rounded-xl bg-slate-950/60 p-3 text-sm text-slate-300"
                >
                  <p className="font-medium text-white">
                    {referral.personName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {referral.facility.name} · {referral.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
