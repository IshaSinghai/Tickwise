import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "DPA — Tickwise",
  description: "Data processing addendum.",
};

export default function DpaPage() {
  return (
    <LegalPage
      title="Data Processing Addendum"
      body="Placeholder DPA. Replace with counsel-reviewed copy before charging real money."
    />
  );
}
