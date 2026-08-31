import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api";
import type { PublicRestaurant, PublicTable } from "@/lib/types";

export default function RestaurantHeader({
  restaurant,
  table,
}: {
  restaurant: PublicRestaurant;
  table: PublicTable;
}) {
  const cover = resolveMediaUrl(restaurant.cover_image);
  const logo = resolveMediaUrl(restaurant.logo);

  return (
    <header className="relative overflow-hidden bg-[var(--brand)] text-[var(--brand-foreground)]">
      <div className="relative h-36 w-full sm:h-44">
        {cover ? (
          <Image src={cover} alt="" fill unoptimized className="object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-black/10" />
        )}
      </div>
      <div className="relative -mt-10 flex items-end gap-3 px-4 pb-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-4 ring-[var(--brand)]">
          {logo ? (
            <Image src={logo} alt={restaurant.name} width={64} height={64} unoptimized className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-[var(--brand)]">
              {restaurant.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="pb-1">
          <h1 className="text-lg font-bold leading-tight">{restaurant.name}</h1>
          <p className="text-xs text-[var(--brand-foreground)]/80">
            Stol: {table.name}{table.place ? ` · ${table.place}` : ""}
          </p>
        </div>
      </div>
      {restaurant.description && (
        <p className="px-4 pb-4 text-sm text-[var(--brand-foreground)]/80">
          {restaurant.description}
        </p>
      )}
    </header>
  );
}
