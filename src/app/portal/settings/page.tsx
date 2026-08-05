import type { Metadata } from "next";

import { Settings } from "./settings-view";

export const metadata: Metadata = {
  title: "Settings — Tickwise portal",
};

export default function SettingsPage() {
  return <Settings />;
}
