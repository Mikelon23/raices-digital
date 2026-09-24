import Link from "next/link";
import { Roles } from "@/config/roles";

export default function DashboardNav({ role }: { role: string }) {
  const links = [
    {
      href: "/dashboard",
      label: "Resumen",
    },
    {
      href: "/dashboard/communities",
      label: "Comunidades",
    },
    {
      href: "/dashboard/products",
      label: "Productos",
    },
    {
      href: "/dashboard/prices",
      label: "Precios",
    },
  ];

  if (role === Roles.ADMIN) {
    links.push({
      href: "/admin",
      label: "Admin",
    });
  }

  return (
    <nav className="mx-auto max-w-6xl px-6 pb-4">
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
