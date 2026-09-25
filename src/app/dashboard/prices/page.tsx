import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCommunitiesForUser,
  getPriceQuotes,
  getProducts,
} from "@/server/queries";
import { canCreatePriceQuote } from "@/config/permissions";
import { createPriceQuote } from "@/server/actions/prices";
import type { Role } from "@/config/roles";
import { formatDateTime, formatMoney } from "@/lib/utils";

export default async function PricesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [prices, products, allowedCommunities] = await Promise.all([
    getPriceQuotes(session),
    getProducts(),
    getCommunitiesForUser(session),
  ]);

  const canCreate = canCreatePriceQuote(session.role as Role);

  const created = searchParams.created === "1";

  const errorCode =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  let errorMessage = "";

  if (errorCode === "forbidden") {
    errorMessage = "No tienes permisos para registrar precios.";
  }

  if (errorCode === "validation") {
    errorMessage = "Los datos del formulario no son válidos.";
  }

  if (errorCode === "community") {
    errorMessage = "La comunidad seleccionada no está permitida para tu usuario.";
  }

  if (errorCode === "product") {
    errorMessage = "El producto seleccionado no existe.";
  }

  if (errorCode === "db") {
    errorMessage = "No se pudo guardar el precio en la base de datos.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Precios agrícolas
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Registro y consulta de precios
        </h2>

        <p className="mt-2 text-slate-400">
          Los agentes y productores pueden reportar precios locales para
          mejorar la toma de decisiones económicas de la comunidad.
        </p>
      </div>

      {created ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Precio registrado correctamente.
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
            Registrar precio
          </h3>

          {allowedCommunities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No tienes comunidades asignadas para registrar precios.
            </p>
          ) : (
            <form
              action={createPriceQuote}
              className="mt-6 grid gap-4 md:grid-cols-5"
            >
              <div>
                <label
                  htmlFor="price-product"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Producto
                </label>

                <select
                  id="price-product"
                  name="productId"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="">Selecciona un producto</option>

                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="price-community"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Comunidad
                </label>

                <select
                  id="price-community"
                  name="communityId"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="">Selecciona una comunidad</option>

                  {allowedCommunities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="price-value"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Precio
                </label>

                <input
                  id="price-value"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="18.50"
                />
              </div>

              <div>
                <label
                  htmlFor="price-currency"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Moneda
                </label>

                <select
                  id="price-currency"
                  name="currency"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="LOCAL">LOCAL</option>
                  <option value="MXN">MXN</option>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="price-source"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Fuente
                </label>

                <input
                  id="price-source"
                  name="source"
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Mercado local"
                />
              </div>

              <div className="md:col-span-5">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Registrar precio
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Precios recientes
        </h3>

        {prices.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún no hay precios visibles para tu usuario.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Comunidad</th>
                  <th className="px-4 py-2">Precio</th>
                  <th className="px-4 py-2">Fuente</th>
                  <th className="px-4 py-2">Reportado por</th>
                </tr>
              </thead>

              <tbody>
                {prices.map((price) => (
                  <tr
                    key={price.id}
                    className="rounded-2xl bg-slate-950/60 text-sm text-slate-300"
                  >
                    <td className="px-4 py-3">
                      {formatDateTime(price.createdAt)}
                    </td>

                    <td className="px-4 py-3 font-medium text-white">
                      {price.product.name}
                    </td>

                    <td className="px-4 py-3">{price.community.name}</td>

                    <td className="px-4 py-3 font-semibold text-emerald-300">
                      {formatMoney(price.price, price.currency)}
                    </td>

                    <td className="px-4 py-3">
                      {price.source ?? "Sin fuente"}
                    </td>

                    <td className="px-4 py-3">
                      {price.reportedBy?.name ?? "N/D"}
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
