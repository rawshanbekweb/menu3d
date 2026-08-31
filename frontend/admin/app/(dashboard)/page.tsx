"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRestaurant } from "@/lib/restaurant";
import { Card } from "@/components/ui";

export default function DashboardHome() {
  const { restaurants, current, loading } = useRestaurant();
  const router = useRouter();

  useEffect(() => {
    if (!loading && restaurants.length === 0) router.replace("/restaurant");
  }, [loading, restaurants, router]);

  if (loading) return <p className="text-sm text-[var(--ink-muted)]">Yuklanmoqda...</p>;
  if (!current) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-[var(--ink)]">Salom, {current.name}!</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--ink-muted)]">Sizning rolingiz</p>
          <p className="text-lg font-semibold capitalize">{current.role}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--ink-muted)]">Holat</p>
          <p className="text-lg font-semibold">{current.is_active ? "Faol" : "To'xtatilgan"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--ink-muted)]">Slug</p>
          <p className="text-lg font-semibold">{current.slug}</p>
        </Card>
      </div>
      <Card>
        <p className="text-sm text-[var(--ink-muted)]">
          Chap menyudan kategoriya va taomlarni qo&apos;shing, stollar uchun QR kod
          generatsiya qiling va xodimlaringizni taklif qiling.
        </p>
      </Card>
    </div>
  );
}
