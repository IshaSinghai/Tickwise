import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, Field } from "./signup";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Tickwise" }] }),
  component: () => (
    <AuthShell title="Reset your password" subtitle="Password reset is on the way. This entry point is stubbed for now.">
      <form className="space-y-4">
        <Field label="Email" type="email" disabled />
        <Button disabled className="w-full">Send reset link (coming soon)</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></div>
    </AuthShell>
  ),
});
