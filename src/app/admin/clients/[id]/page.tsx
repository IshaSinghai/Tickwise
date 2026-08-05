import type { Metadata } from "next";

import { AdminClientDetailView } from "./client-view";

export const metadata: Metadata = {
  title: "Client — Tickwise admin",
  robots: { index: false, follow: false },
};

/*
 * The detail view behind each row of the client list.
 *
 * `params` is a promise in Next 15. The id is read here and handed to the client
 * view as a plain prop so the view itself stays a straightforward
 * useAsync-over-lib/api component like every other page in this realm.
 */
export default async function AdminClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminClientDetailView id={id} />;
}
