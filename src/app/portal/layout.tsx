import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RealmGuard } from "@/components/auth/RealmGuard";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Developer portal — Tickwise",
  description: "Manage your API keys, usage and billing.",
  // The portal is behind auth and has nothing to offer a crawler.
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  // The guard sits outside PortalShell so an unauthenticated visitor doesn't
  // even see the portal chrome (sidebar, account menu) before redirecting.
  return (
    <RealmGuard realm="portal">
      <PortalShell>{children}</PortalShell>
    </RealmGuard>
  );
}
