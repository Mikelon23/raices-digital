import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getListings, getActiveListings } from "@/server/queries-market";
import { getProducts, getCommunitiesForUser } from "@/server/queries";
import { canCreateSellListing, canCreateBuyListing } from "@/config/permissions";
import { createListing } from "@/server/actions/listings";
import { updateListingStatus } from "@/server/actions/listing-status";
import type { Role } from "@/config/roles";
import { formatDateTime, formatMoney } from "@/lib/utils";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [allListings, activeListings, products, communities] = await Promise.all([
    getListings(session),
    getActiveListings(session),
    getProducts(),
    getCommunitiesForUser(session),
  ]);

  const canCreateSell = canCreateSellListing(session.role as Role);
  const canCreateBuy = canCreateBuyListing(session.role as Role);
  const canCreate = canCreateSell || canCreateBuy;

  const sellListings = allListings.filter((l) => l.type === "SELL");
  const buyListings = allListings.filter((l) => l.type === "BUY");

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

  if (errorCode === "community") {
    errorMessage = "La comunidad seleccionada no está permitida para tu usuario.";
  }

  if (errorCode === "product") {
    errorMessage = "El producto seleccionado no existe.";
  }

  if (errorCode === "listing") {
    errorMessage = "La publicación no existe o no tienes acceso.";
  }

  if (errorCode === "db") {
    errorMessage = "No se pudo guardar en la base de datos.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Mercado local
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Publicaciones de compra y venta
        </h2>

        <p className="mt-2 text-slate-400">
          Gestiona publicaciones de productos agrícolas para la comunidad.
        </p>
      </div>

      {created ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Publicación creada correctamente.
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

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Total publicaciones</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {allListings.length}
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="text-sm text-emerald-300">Activas</p>
          <p className="mt-2 text-4xl font-bold text-emerald-200">
            {activeListings.length}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Ventas</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {sellListings.length}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Compras</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {buyListings.length}
          </p>
        </div>
      </div>

      {canCreate ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Crear publicación
          </h3>

          {communities.length === 0 || products.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              {communities.length === 0
                ? "No tienes comunidades asignadas para crear publicaciones."
                : "No hay productos registrados. Primero crea productos en el catálogo."}
            </p>
          ) : (
            <form
              action={createListing}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="listing-type"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Tipo de publicación
                </label>

                <select
                  id="listing-type"
                  name="type"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  {canCreateSell && <option value="SELL">Venta</option>}
                  {canCreateBuy && <option value="BUY">Compra</option>}
                </select>
              </div>

              <div>
                <label
                  htmlFor="listing-product"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Producto
                </label>

                <select
                  id="listing-product"
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
                  htmlFor="listing-community"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Comunidad
                </label>

                <select
                  id="listing-community"
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

              <div>
                <label
                  htmlFor="listing-quantity"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Cantidad
                </label>

                <input
                  id="listing-quantity"
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="10.5"
                />
              </div>

              <div>
                <label
                  htmlFor="listing-price"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Precio unitario
                </label>

                <input
                  id="listing-price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label
                  htmlFor="listing-currency"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Moneda
                </label>

                <select
                  id="listing-currency"
                  name="currency"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="LOCAL">LOCAL</option>
                  <option value="MXN">MXN</option>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="listing-description"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Descripción (opcional)
                </label>

                <textarea
                  id="listing-description"
                  name="description"
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Información adicional sobre la publicación..."
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Crear publicación
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Publicaciones registradas
        </h3>

        {allListings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún no hay publicaciones registradas.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1100px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Comunidad</th>
                  <th className="px-4 py-2">Cantidad</th>
                  <th className="px-4 py-2">Precio</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Creado por</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {allListings.map((listing) => {
                  const canUpdate =
                    listing.createdById === session.id ||
                    session.role === "ADMIN";

                  return (
                    <tr
                      key={listing.id}
                      className="rounded-2xl bg-slate-950/60 text-sm text-slate-300"
                    >
                      <td className="px-4 py-3">
                        {formatDateTime(listing.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            listing.type === "SELL"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {listing.type === "SELL" ? "Venta" : "Compra"}
                        </span>
                      </td>

