"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { useState } from "react";

export function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell title="Sign in">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => router.push("/portal"), 400);
        }}
      >
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link>
        </div>
        <Button className="w-full bg-gradient-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        No account? <Link href="/signup" className="text-primary hover:underline">Create one</Link>
      </div>
    </AuthShell>
  );
}
