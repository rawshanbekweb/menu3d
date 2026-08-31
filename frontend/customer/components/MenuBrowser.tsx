"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import FoodCard from "./FoodCard";
import type { PublicCategory, PublicEat } from "@/lib/types";

// model-viewer touches browser globals at module load time, so it must
// never be evaluated during SSR.
const FoodDetailModal = dynamic(() => import("./FoodDetailModal"), { ssr: false });

export default function MenuBrowser({ categories }: { categories: PublicCategory[] }) {
  const visibleCategories = categories.filter((c) => c.eats.length > 0);
  const [activeId, setActiveId] = useState(visibleCategories[0]?.id ?? null);
  const [selectedEat, setSelectedEat] = useState<PublicEat | null>(null);

  if (visibleCategories.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-neutral-500">
        Hozircha menyu bo&apos;sh.
      </p>
    );
  }

  const active = visibleCategories.find((c) => c.id === activeId) ?? visibleCategories[0];

  return (
    <div className="flex flex-1 flex-col">
      <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
        {visibleCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              c.id === active.id
                ? "bg-[var(--brand)] text-[var(--brand-foreground)]"
                : "bg-white text-neutral-600 ring-1 ring-black/5"
            }`}
          >
            {c.name}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {active.eats.map((eat) => (
          <FoodCard key={eat.id} eat={eat} onSelect={() => setSelectedEat(eat)} />
        ))}
      </div>

      {selectedEat && (
        <FoodDetailModal eat={selectedEat} onClose={() => setSelectedEat(null)} />
      )}
    </div>
  );
}
