"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-400">Yuklanmoqda...</div>;
  }
  if (!user) return null;

  if (!user.is_superuser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-neutral-600">
          Bu hisob ({user.username}) platforma administratori emas.
        </p>
        <Button variant="secondary" onClick={logout}>
          Boshqa hisob bilan kirish
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Menu3D — Super Admin</h1>
        <Button variant="secondary" onClick={logout}>
          Chiqish
        </Button>
      </div>
      {children}
    </div>
  );
}
