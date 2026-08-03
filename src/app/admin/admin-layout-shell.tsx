"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { RealmGuard } from "@/components/auth/RealmGuard";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // The login page lives inside /admin but must render without the panel chrome
  // — and without the guard, or it would redirect to itself.
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <RealmGuard realm="admin">
      <AdminShell>{children}</AdminShell>
    </RealmGuard>
  );
}
