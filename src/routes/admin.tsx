import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin panel — Tickwise" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const path = useRouterState({ select: (s) => s.location.pathname });
    if (path === "/admin/login") return <Outlet />;
    return <AdminShell><Outlet /></AdminShell>;
  },
});
