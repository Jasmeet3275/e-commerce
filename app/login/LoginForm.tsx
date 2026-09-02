"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";

import { safeRedirectPath } from "@/lib/auth/redirect";
import { login } from "@/lib/services/authService";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await login({ email, password });
      setSession(session.accessToken, session.user);
      router.push(safeRedirectPath(searchParams.get("redirect")));
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-600">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-600">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
