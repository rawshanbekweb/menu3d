"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useRestaurant } from "@/lib/restaurant";
import { Button } from "./ui";

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/restaurant", label: "Restoran profili" },
  { href: "/categories", label: "Kategoriyalar" },
  { href: "/menu", label: "Taomlar" },
  { href: "/tables", label: "Stollar / QR" },
  { href: "/staff", label: "Xodimlar", roles: ["owner", "manager"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { restaurants, current, setCurrentId, loading } = useRestaurant();

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg italic text-[var(--ink)]">Menu3D</p>
        <span className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-xs text-[var(--ink-muted)]">
          {user?.username}
        </span>
      </div>

      {!loading && restaurants.length > 1 && (
        <select
          value={current?.id ?? ""}
          onChange={(e) => setCurrentId(Number(e.target.value))}
          className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)]"
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      <nav className="flex flex-1 flex-col gap-0.5">
        {links
          .filter((link) => !link.roles || (current && link.roles.includes(current.role)))
          .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              pathname === link.href
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--ink-muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Button variant="secondary" onClick={logout}>
        Chiqish
      </Button>
    </aside>
  );
}
