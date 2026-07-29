import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field } from "./signup";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin sign in — Tickwise" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    return (
      <AuthShell title="Admin sign in" subtitle="Internal use only.">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => nav({ to: "/admin" }), 400); }}>
          <Field label="Email" type="email" required />
          <Field label="Password" type="password" required />
          <Button className="w-full bg-gradient-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        </form>
      </AuthShell>
    );
  },
});
