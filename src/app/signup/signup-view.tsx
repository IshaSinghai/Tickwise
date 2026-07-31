"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { useState } from "react";

export function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell title="Create your account" subtitle="Free tier includes 25,000 units a month. No card needed.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => router.push("/portal"), 500);
        }}
      >
        <Field label="Work email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Button className="w-full bg-gradient-primary" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </div>
    </AuthShell>
  );
}
