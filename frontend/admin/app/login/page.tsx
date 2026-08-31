"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.push("/");
    } catch {
      setError("Login yoki parol xato.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-xl italic text-[var(--ink)]">Menu3D</h1>
        <p className="mb-5 text-sm text-[var(--ink-muted)]">Restoran admin panel</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label="Login">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </Field>
          <Field label="Parol">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Kirilmoqda..." : "Kirish"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--ink-muted)]">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-medium text-[var(--ink)] underline">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </Card>
    </main>
  );
}
