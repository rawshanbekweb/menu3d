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
    <aside className="flex w-60 shrink-0 flex-col gap-4 border-r border-neutral-200 bg-white p-4">
      <div>
        <p className="text-sm font-bold text-neutral-900">Menu3D</p>
        <p className="text-xs text-neutral-400">{user?.username}</p>
      </div>

      {!loading && restaurants.length > 1 && (
        <select
          value={current?.id ?? ""}
          onChange={(e) => setCurrentId(Number(e.target.value))}
          className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      <nav className="flex flex-1 flex-col gap-1">
        {links
          .filter((link) => !link.roles || (current && link.roles.includes(current.role)))
          .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === link.href
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
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
