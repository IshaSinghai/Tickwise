import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "./signup";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify your email — Tickwise" }] }),
  component: () => (
    <AuthShell title="Email verified">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="mt-4 text-sm text-muted-foreground">Your email is confirmed. Head into the portal to create your first key.</p>
        <Button asChild className="mt-6 w-full bg-gradient-primary"><Link to="/portal">Open portal</Link></Button>
      </div>
    </AuthShell>
  ),
});
