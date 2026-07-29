import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "./legal.terms";
export const Route = createFileRoute("/legal/dpa")({
  head: () => ({ meta: [{ title: "DPA — Tickwise" }, { name: "description", content: "Data processing addendum." }] }),
  component: () => <LegalPage title="Data Processing Addendum" body="Placeholder DPA. Replace with counsel-reviewed copy before charging real money." />,
});
