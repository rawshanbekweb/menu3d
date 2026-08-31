import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { PublicEat } from "@/lib/types";

export default function FoodCard({
  eat,
  onSelect,
}: {
  eat: PublicEat;
  onSelect: () => void;
}) {
  const hasAr = Boolean(eat.model_url);
  const imageUrl = resolveMediaUrl(eat.image);

  return (
    <button
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={eat.name}
            fill
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {hasAr && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[var(--brand)] px-2.5 py-1 text-xs font-medium text-[var(--brand-foreground)] shadow">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.5 5.5 7.9 12 4.3ZM5 9.2l6 3.3v7L5 16.2V9.2Zm8 10.3v-7l6-3.3v7l-6 3.3Z" />
            </svg>
            AR
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold text-neutral-900">{eat.name}</h3>
        <p className="line-clamp-2 text-xs text-neutral-500">{eat.description}</p>
        <p className="mt-auto pt-2 text-sm font-semibold text-[var(--brand)]">
          {formatPrice(eat.price)}
        </p>
      </div>
    </button>
  );
}
