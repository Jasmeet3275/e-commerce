"use client";

import { useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { login } from "@/lib/services/authService";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function LoginForm() {
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
      // Hard navigation, not router.push: the refresh_token cookie was just
      // set by the server, but Next's client Router Cache has no visibility
      // into that — a prior unauthenticated visit to the redirect target can
      // leave a stale "middleware redirected to /login" entry cached, which
      // router.push would silently reuse instead of re-checking auth.
      window.location.href = safeRedirectPath(searchParams.get("redirect"));
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
