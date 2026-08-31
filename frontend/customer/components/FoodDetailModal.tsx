"use client";

import { useEffect } from "react";
import "@google/model-viewer";
import { resolveMediaUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { PublicEat } from "@/lib/types";

export default function FoodDetailModal({
  eat,
  onClose,
}: {
  eat: PublicEat;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const imageUrl = resolveMediaUrl(eat.image);
  const hasAr = Boolean(eat.model_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 w-full shrink-0 bg-neutral-100 sm:h-72">
          {hasAr ? (
            <model-viewer
              src={eat.model_url ?? undefined}
              poster={imageUrl ?? undefined}
              alt={eat.name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
            >
              <button
                slot="ar-button"
                className="absolute bottom-3 right-3 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)] shadow-lg"
              >
                Stol ustida ko&apos;rish (AR)
              </button>
            </model-viewer>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={eat.name} className="h-full w-full object-cover" />
          ) : null}

          <button
            onClick={onClose}
            aria-label="Yopish"
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto p-4">
          <h2 className="text-lg font-bold text-neutral-900">{eat.name}</h2>
          <p className="text-sm text-neutral-600">{eat.description}</p>
          <p className="pt-1 text-base font-semibold text-[var(--brand)]">
            {formatPrice(eat.price)}
          </p>
          {!hasAr && (
            <p className="rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-500">
              Bu taom uchun 3D ko&apos;rinish hali tayyorlanmoqda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
