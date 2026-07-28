import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "./legal.terms";
export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy — CopyPools" }, { name: "description", content: "What we collect and why." }] }),
  component: () => <LegalPage title="Privacy" body="Placeholder privacy notice. Replace with counsel-reviewed copy before charging real money." />,
});
