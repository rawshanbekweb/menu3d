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
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-sheet-up flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[var(--surface)] sm:max-w-md sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 w-full shrink-0 bg-[var(--line)] sm:h-80">
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
                className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-foreground)] shadow-lg shadow-black/10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.5 5.5 7.9 12 4.3ZM5 9.2l6 3.3v7L5 16.2V9.2Zm8 10.3v-7l6-3.3v7l-6 3.3Z" />
                </svg>
                Stol ustida ko&apos;rish
              </button>
            </model-viewer>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={eat.name} className="h-full w-full object-cover" />
          ) : null}

          <span className="absolute left-1/2 top-3 h-1 w-9 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" />

          <button
            onClick={onClose}
            aria-label="Yopish"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--ink)] backdrop-blur-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5 overflow-y-auto p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--ink)]">
            {eat.name}
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">{eat.description}</p>
          <p className="pt-1 text-lg font-semibold text-[var(--ink)]">
            {formatPrice(eat.price)}
          </p>
          {!hasAr && (
            <p className="mt-1 rounded-xl bg-[var(--bg)] px-3.5 py-2.5 text-[13px] text-[var(--ink-muted)]">
              Bu taom uchun 3D ko&apos;rinish hali tayyorlanmoqda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
