import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify your email — Tickwise",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Email verified">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="mt-4 text-sm text-muted-foreground">Your email is confirmed. Head into the portal to create your first key.</p>
        <Button asChild className="mt-6 w-full bg-gradient-primary"><Link href="/portal">Open portal</Link></Button>
      </div>
    </AuthShell>
  );
}
