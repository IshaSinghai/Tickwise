"use client";

import { useRouter } from "next/navigation";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { issuePlaceholderSession } from "@/lib/auth";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell title="Admin sign in" subtitle="Internal use only.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          // Writes the admin token specifically, so an admin session never
          // grants portal access or vice versa.
          issuePlaceholderSession("admin");
          setTimeout(() => router.push("/admin"), 400);
        }}
      >
        <Field label="Email" type="email" required />
        <Field label="Password" type="password" required />
        <Button className="w-full bg-gradient-primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
