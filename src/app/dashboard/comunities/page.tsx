import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCommunitiesForUser } from "@/server/queries";
import { canManageCommunities } from "@/config/permissions";
import { createCommunity } from "@/server/actions/communities";
import type { Role } from "@/config/roles";
import { formatDateTime } from "@/lib/utils";

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const communities = await getCommunitiesForUser(session);

  const canCreate = canManageCommunities(session.role as Role);

  const created = searchParams.created === "1";

  const errorCode =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  let errorMessage = "";

  if (errorCode === "forbidden") {
    errorMessage = "No tienes permisos para crear comunidades.";
  }

  if (errorCode === "validation") {
    errorMessage = "Los datos del formulario no son válidos.";
  }

  if (errorCode === "db") {
    errorMessage = "No se pudo guardar en la base de datos.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Comunidades
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Gestión comunitaria
        </h2>

        <p className="mt-2 text-slate-400">
          Las comunidades representan los núcleos locales donde operan los
          agentes de Raíces Digital.
        </p>
      </div>

      {created ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Comunidad creada correctamente.
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
            Crear comunidad
          </h3>

          <form action={createCommunity} className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="community-name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nombre
              </label>

              <input
                id="community-name"
                name="name"
                type="text"
                required
                minLength={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                placeholder="Comunidad Rural Norte"
              />
            </div>

            <div>
              <label
                htmlFor="community-region"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Región
              </label>

              <input
                id="community-region"
                name="region"
                type="text"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                placeholder="Zona rural"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Crear comunidad
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Comunidades disponibles
        </h3>

        {communities.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún no tienes comunidades visibles.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Slug</th>
                  <th className="px-4 py-2">Región</th>
                  <th className="px-4 py-2">Miembros</th>
                  <th className="px-4 py-2">Activa</th>
                  <th className="px-4 py-2">Creada</th>
                </tr>
              </thead>

              <tbody>
                {communities.map((community) => (
                  <tr
                    key={community.id}
                    className="rounded-2xl bg-slate-950/60 text-sm text-slate-300"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {community.name}
                    </td>

                    <td className="px-4 py-3">{community.slug}</td>

                    <td className="px-4 py-3">
                      {community.region ?? "Sin región"}
                    </td>

                    <td className="px-4 py-3">
                      {community._count.memberships}
                    </td>

                    <td className="px-4 py-3">
                      {community.isActive ? "Sí" : "No"}
                    </td>

                    <td className="px-4 py-3">
                      {formatDateTime(community.createdAt)}
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
