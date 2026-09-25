import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories, getProducts } from "@/server/queries";
import { canManageCatalog } from "@/config/permissions";
import { createProduct } from "@/server/actions/products";
import type { Role } from "@/config/roles";
import { formatDateTime } from "@/lib/utils";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const canCreate = canManageCatalog(session.role as Role);

  const created = searchParams.created === "1";

  const errorCode =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  let errorMessage = "";

  if (errorCode === "forbidden") {
    errorMessage = "No tienes permisos para crear productos.";
  }

  if (errorCode === "validation") {
    errorMessage = "Los datos del formulario no son válidos.";
  }

  if (errorCode === "db") {
    errorMessage =
      "No se pudo guardar el producto. Puede que ya exista uno con el mismo nombre y unidad.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Productos
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Catálogo de productos agrícolas
        </h2>

        <p className="mt-2 text-slate-400">
          Estos productos se usarán para registrar precios y publicaciones de
          mercado local.
        </p>
      </div>

      {created ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Producto creado correctamente.
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
            Crear producto
          </h3>

          <form action={createProduct} className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nombre
              </label>

              <input
                id="product-name"
                name="name"
                type="text"
                required
                minLength={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                placeholder="Chile"
              />
            </div>

            <div>
              <label
                htmlFor="product-unit"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Unidad
              </label>

              <select
                id="product-unit"
                name="unit"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              >
                <option value="kg">kg</option>
                <option value="unidad">unidad</option>
                <option value="litro">litro</option>
                <option value="pieza">pieza</option>
                <option value="saco">saco</option>
                <option value="tonelada">tonelada</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="product-category"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Categoría
              </label>

              <select
                id="product-category"
                name="categoryId"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              >
                <option value="">Sin categoría</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Crear producto
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">
          Productos registrados
        </h3>

        {products.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún no hay productos registrados.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Unidad</th>
                  <th className="px-4 py-2">Categoría</th>
                  <th className="px-4 py-2">Creado</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="rounded-2xl bg-slate-950/60 text-sm text-slate-300"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {product.name}
                    </td>

                    <td className="px-4 py-3">{product.unit}</td>

                    <td className="px-4 py-3">
                      {product.category?.name ?? "Sin categoría"}
                    </td>

                    <td className="px-4 py-3">
                      {formatDateTime(product.createdAt)}
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
