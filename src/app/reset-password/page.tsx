import type { Metadata } from "next";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Set a new password — Tickwise",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password">
      <form className="space-y-4">
        <Field label="New password" type="password" disabled />
        <Field label="Confirm password" type="password" disabled />
        <Button disabled className="w-full">
          Save password (coming soon)
        </Button>
      </form>
    </AuthShell>
  );
}
