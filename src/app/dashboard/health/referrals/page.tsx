import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHealthReferrals } from "@/server/queries-health";
import { getHealthFacilities } from "@/server/queries-health";
import { canCreateHealthReferral, canUpdateReferralStatus } from "@/config/permissions";
import { createHealthReferral } from "@/server/actions/health-referrals";
import { updateReferralStatus } from "@/server/actions/health-referral-status";
import type { Role } from "@/config/roles";
import { formatDateTime } from "@/lib/utils";

export default async function HealthReferralsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [referrals, facilities] = await Promise.all([
    getHealthReferrals(session),
    getHealthFacilities(session),
  ]);

  const canCreate = canCreateHealthReferral(session.role as Role);
  const canUpdate = canUpdateReferralStatus(session.role as Role);

  const created = searchParams.created === "1";
  const updated = searchParams.updated === "1";

  const errorCode =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  let errorMessage = "";

  if (errorCode === "forbidden") {
    errorMessage = "No tienes permisos para realizar esta acción.";
  }

  if (errorCode === "validation") {
    errorMessage = "Los datos del formulario no son válidos.";
  }

  if (errorCode === "facility") {
    errorMessage = "El centro de salud seleccionado no está permitido para tu usuario.";
  }

  if (errorCode === "db") {
    errorMessage = "No se pudo guardar en la base de datos.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Referencias de salud
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Registro de referencias básicas
        </h2>

        <p className="mt-2 text-slate-400">
          Registra referencias de salud para miembros de la comunidad y actualiza su estado.
        </p>
      </div>

      {created ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Referencia creada correctamente.
        </div>
      ) : null}

      {updated ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Estado actualizado correctamente.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {canCreate ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Crear referencia de salud
          </h3>

          {facilities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No hay centros de salud disponibles para crear referencias.
            </p>
          ) : (
            <form
              action={createHealthReferral}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="referral-facility"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Centro de salud
                </label>

                <select
                  id="referral-facility"
                  name="facilityId"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="">Selecciona un centro</option>

                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="referral-status"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Estado inicial
                </label>

                <select
                  id="referral-status"
                  name="status"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="OPEN">Abierta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="referral-person-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nombre de la persona
                </label>

                <input
                  id="referral-person-name"
                  name="personName"
                  type="text"
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label
                  htmlFor="referral-person-phone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Teléfono de contacto
                </label>

                <input
                  id="referral-person-phone"
                  name="personPhone"
                  type="tel"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="000000000"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="referral-reason"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Motivo de la referencia
                </label>

                <textarea
                  id="referral-reason"
                  name="reason"
                  required
                  minLength={5}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Descripción del motivo de la referencia..."
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="referral-notes"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Notas adicionales (opcional)
                </label>

                <textarea
                  id="referral-notes"
                  name="notes"
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Información adicional..."
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Crear referencia
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Referencias registradas
        </h3>

        {referrals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún no hay referencias registradas.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1000px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Persona</th>
                  <th className="px-4 py-2">Centro de salud</th>
                  <th className="px-4 py-2">Motivo</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Agente</th>
                  {canUpdate ? <th className="px-4 py-2">Acciones</th> : null}
                </tr>
              </thead>

              <tbody>
                {referrals.map((referral) => (
                  <tr
                    key={referral.id}
                    className="rounded-2xl bg-slate-950/60 text-sm text-slate-300"
                  >
                    <td className="px-4 py-3">
                      {formatDateTime(referral.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">
                          {referral.personName}
                        </p>
                        {referral.personPhone ? (
                          <p className="text-xs text-slate-500">
                            {referral.personPhone}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">
                          {referral.facility.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {referral.facility.community.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate">{referral.reason}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          referral.status === "URGENT"
                            ? "bg-red-500/20 text-red-300"
                            : referral.status === "ATTENDED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : referral.status === "CLOSED"
                            ? "bg-slate-500/20 text-slate-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {referral.agent?.name ?? "N/D"}
                    </td>

                    {canUpdate ? (
                      <td className="px-4 py-3">
                        <form action={updateReferralStatus} className="flex gap-2">
                          <input
                            type="hidden"
                            name="referralId"
                            value={referral.id}
                          />

                          <select
                            name="status"
                            defaultValue={referral.status}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                          >
                            <option value="OPEN">Abierta</option>
                            <option value="URGENT">Urgente</option>
                            <option value="ATTENDED">Atendida</option>
                            <option value="CLOSED">Cerrada</option>
                          </select>

                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                          >
                            Actualizar
                          </button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
