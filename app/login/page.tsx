import { Suspense } from "react";

import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
