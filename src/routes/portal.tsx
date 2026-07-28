import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Developer portal — CopyPools" }, { name: "description", content: "Manage your API keys, usage and billing." }] }),
  component: () => (
    <PortalShell>
      <Outlet />
    </PortalShell>
  ),
});
