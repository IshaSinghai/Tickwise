import type { Metadata } from "next";

import { Keys } from "./keys-view";

export const metadata: Metadata = {
  title: "API keys — Tickwise portal",
};

export default function KeysPage() {
  return <Keys />;
}
