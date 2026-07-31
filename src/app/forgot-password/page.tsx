import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Forgot password — Tickwise",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Password reset is on the way. This entry point is stubbed for now.">
      <form className="space-y-4">
        <Field label="Email" type="email" disabled />
        <Button disabled className="w-full">Send reset link (coming soon)</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground"><Link href="/login" className="text-primary hover:underline">Back to sign in</Link></div>
    </AuthShell>
  );
}
