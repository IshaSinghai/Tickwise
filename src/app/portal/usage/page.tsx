import type { Metadata } from "next";

import { Usage } from "./usage-view";

export const metadata: Metadata = {
  title: "Usage — Tickwise portal",
};

export default function UsagePage() {
  return <Usage />;
}
