import type { Metadata } from "next";

import { AdminClients } from "./clients-view";

export const metadata: Metadata = {
  title: "Clients — Tickwise admin",
  robots: { index: false, follow: false },
};

export default function AdminClientsPage() {
  return <AdminClients />;
}
