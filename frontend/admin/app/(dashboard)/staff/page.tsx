"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useRestaurant } from "@/lib/restaurant";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";
import type { RestaurantRole, RestaurantStaff } from "@/lib/types";

export default function StaffPage() {
  const { current, loading: restaurantLoading } = useRestaurant();
  const [staff, setStaff] = useState<RestaurantStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<RestaurantRole>("waiter");
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const isOwner = current?.role === "owner";

  const load = async () => {
    if (!current) return;
    setLoading(true);
    setLoadError(false);
    try {
      const data = await apiFetch<{ results: RestaurantStaff[] }>(`/api/restaurant/${current.id}/staff/`);
      setStaff(data.results);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload when the selected restaurant changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setError(null);
    try {
      await apiFetch(`/api/restaurant/${current.id}/staff/`, {
        method: "POST",
        body: JSON.stringify({ username, role }),
      });
      setUsername("");
      setRole("waiter");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    }
  };

  const remove = async (member: RestaurantStaff) => {
    if (!current) return;
    if (!confirm(`${member.user.username}ni jamoadan chiqarasizmi?`)) return;
    try {
      await apiFetch(`/api/restaurant/${current.id}/staff/${member.id}/`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    }
  };

  if (restaurantLoading) return <p className="text-sm text-neutral-400">Yuklanmoqda...</p>;
  if (!current) return <p className="text-sm text-neutral-500">Avval restoran yarating.</p>;
  if (loadError) return <p className="text-sm text-neutral-500">Bu bo&apos;limni faqat egasi va menejer ko&apos;ra oladi.</p>;

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-lg font-bold text-neutral-900">Xodimlar</h1>

      {isOwner && (
        <Card>
          <form onSubmit={onInvite} className="flex items-end gap-2">
            <Field label="Foydalanuvchi login">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </Field>
            <Field label="Rol">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RestaurantRole)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="waiter">Ofitsiant</option>
                <option value="manager">Menejer</option>
              </select>
            </Field>
            <Button type="submit">Qo&apos;shish</Button>
          </form>
          <ErrorText>{error}</ErrorText>
          <p className="mt-2 text-xs text-neutral-400">
            Foydalanuvchi avval Menu3D&apos;da ro&apos;yxatdan o&apos;tgan bo&apos;lishi kerak.
          </p>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-neutral-400">Yuklanmoqda...</p>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-neutral-100">
            {staff.map((member) => (
              <li key={member.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{member.user.username}</p>
                  <p className="text-xs capitalize text-neutral-500">{member.role}</p>
                </div>
                {isOwner && member.role !== "owner" && (
                  <Button variant="danger" onClick={() => remove(member)}>
                    Chiqarish
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
