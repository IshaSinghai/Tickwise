import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminLayoutShell } from "./admin-layout-shell";

export const metadata: Metadata = {
  title: "Admin panel — Tickwise",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
