import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHealthFacilities } from "@/server/queries-health";
import { getCommunitiesForUser } from "@/server/queries";
import { canUpdateHealthFacilities } from "@/config/permissions";
import { createHealthFacility } from "@/server/actions/health-facilities";
import type { Role } from "@/config/roles";
import { formatDateTime } from "@/lib/utils";

export default async function HealthFacilitiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [facilities, communities] = await Promise.all([
    getHealthFacilities(session),
    getCommunitiesForUser(session),
  ]);

  const canCreate = canUpdateHealthFacilities(session.role as Role);

  const created = searchParams.created === "1";

  const errorCode =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  let errorMessage = "";

  if (errorCode === "forbidden") {
    errorMessage = "No tienes permisos para crear centros de salud.";
  }

  if (errorCode === "validation") {
    errorMessage = "Los datos del formulario no son válidos.";
  }

  if (errorCode === "community") {
    errorMessage = "La comunidad seleccionada no está permitida para tu usuario.";
  }

  if (errorCode === "db") {
    errorMessage = "No se pudo guardar el centro de salud en la base de datos.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Centros de salud
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Directorio de salud comunitaria
        </h2>

        <p className="mt-2 text-slate-400">
          Gestiona los centros de salud locales disponibles para la comunidad.
        </p>
      </div>

      {created ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Centro de salud creado correctamente.
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
            Crear centro de salud
          </h3>

          {communities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No tienes comunidades asignadas para crear centros de salud.
            </p>
          ) : (
            <form
              action={createHealthFacility}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="facility-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nombre
                </label>

                <input
                  id="facility-name"
                  name="name"
                  type="text"
                  required
                  minLength={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Centro de Salud Rural Norte"
                />
              </div>

              <div>
                <label
                  htmlFor="facility-type"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Tipo
                </label>

                <select
                  id="facility-type"
                  name="type"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="CLINIC">Clínica</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="PHARMACY">Farmacia</option>
                  <option value="HEALTH_POST">Puesto de salud</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="facility-phone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Teléfono
                </label>

                <input
                  id="facility-phone"
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="000000000"
                />
              </div>

              <div>
                <label
                  htmlFor="facility-address"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Dirección
                </label>

                <input
                  id="facility-address"
                  name="address"
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Calle principal, Centro"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="facility-community"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Comunidad
                </label>

                <select
                  id="facility-community"
                  name="communityId"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="">Selecciona una comunidad</option>

                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Crear centro de salud
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Centros de salud registrados
        </h3>

        {facilities.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún no hay centros de salud registrados.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Comunidad</th>
                  <th className="px-4 py-2">Teléfono</th>
                  <th className="px-4 py-2">Dirección</th>
                  <th className="px-4 py-2">Creado</th>
                </tr>
              </thead>

              <tbody>
                {facilities.map((facility) => (
                  <tr
                    key={facility.id}
                    className="rounded-2xl bg-slate-950/60 text-sm text-slate-300"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {facility.name}
                    </td>

                    <td className="px-4 py-3">{facility.type}</td>

                    <td className="px-4 py-3">{facility.community.name}</td>

                    <td className="px-4 py-3">
                      {facility.phone ?? "Sin teléfono"}
                    </td>

                    <td className="px-4 py-3">
                      {facility.address ?? "Sin dirección"}
                    </td>

                    <td className="px-4 py-3">
                      {formatDateTime(facility.createdAt)}
                    </td>
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
