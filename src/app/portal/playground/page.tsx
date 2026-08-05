import type { Metadata } from "next";

import { getPublicUnitCosts } from "@/lib/public-data";

import { Playground } from "./playground-view";

export const metadata: Metadata = {
  title: "API playground — Tickwise portal",
};

/*
 * The endpoint list in the picker is the same unit-cost catalog /pricing and
 * /docs/units-and-limits publish, fetched here rather than imported by the view so
 * there is one source for "which endpoints exist and what they cost".
 */
export default async function PlaygroundPage() {
  const endpoints = await getPublicUnitCosts();
  return <Playground endpoints={endpoints} />;
}
