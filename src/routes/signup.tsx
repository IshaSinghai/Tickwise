import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — CopyPools" }, { name: "description", content: "Sign up in 30 seconds. Free tier includes 25,000 units/month." }] }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell title="Create your account" subtitle="Free tier includes 25,000 units a month. No card needed.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => nav({ to: "/portal" }), 500);
        }}
      >
        <Field label="Work email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Button className="w-full bg-gradient-primary" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow"><span className="font-mono text-xs">CP</span></span>
          CopyPools
        </Link>
        <div className="rounded-2xl border border-border/60 bg-surface p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input {...props} />
    </div>
  );
}
