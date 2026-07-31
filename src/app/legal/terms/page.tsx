import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Tickwise",
  description: "The rules of using the Tickwise Dex API.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      body="These are placeholder terms. Replace with counsel-reviewed copy before charging real money."
    />
  );
}
