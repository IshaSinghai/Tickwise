import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "./signup";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Tickwise" }, { name: "description", content: "Sign in to your Tickwise developer portal." }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell title="Sign in">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => nav({ to: "/portal" }), 400);
        }}
      >
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link>
        </div>
        <Button className="w-full bg-gradient-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        No account? <Link to="/signup" className="text-primary hover:underline">Create one</Link>
      </div>
    </AuthShell>
  );
}
