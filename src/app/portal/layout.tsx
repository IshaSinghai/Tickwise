import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Developer portal — Tickwise",
  description: "Manage your API keys, usage and billing.",
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
