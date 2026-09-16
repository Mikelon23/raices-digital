"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-red-400 hover:text-red-300"
    >
      Cerrar sesión
    </button>
  );
}
