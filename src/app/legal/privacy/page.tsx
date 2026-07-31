import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — Tickwise",
  description: "What we collect and why.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      body="Placeholder privacy notice. Replace with counsel-reviewed copy before charging real money."
    />
  );
}
