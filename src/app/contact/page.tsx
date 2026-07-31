import type { Metadata } from "next";

import { Contact } from "./contact-view";

export const metadata: Metadata = {
  title: "Contact sales — Tickwise",
  description: "Talk to us about enterprise, custom chains, or bespoke SLAs.",
  openGraph: {
    title: "Contact Tickwise",
    description: "Enterprise, custom chain requests, partnerships.",
  },
};

export default function ContactPage() {
  return <Contact />;
}
