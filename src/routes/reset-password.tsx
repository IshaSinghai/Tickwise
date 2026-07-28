import { createFileRoute } from "@tanstack/react-router";
import { AuthShell, Field } from "./signup";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — CopyPools" }] }),
  component: () => (
    <AuthShell title="Set a new password">
      <form className="space-y-4">
        <Field label="New password" type="password" disabled />
        <Field label="Confirm password" type="password" disabled />
        <Button disabled className="w-full">Save password (coming soon)</Button>
      </form>
    </AuthShell>
  ),
});
