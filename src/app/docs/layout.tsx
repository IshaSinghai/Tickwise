import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DocsShell } from "./docs-shell";

export const metadata: Metadata = {
  title: "Docs — Tickwise Dex API",
  description:
    "Quickstart, authentication, endpoint reference and error codes for the Tickwise Dex API.",
  openGraph: {
    title: "Tickwise docs",
    description: "Ship in five minutes. Every endpoint documented with real examples.",
  },
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
