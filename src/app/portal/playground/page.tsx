import type { Metadata } from "next";

import { Playground } from "./playground-view";

export const metadata: Metadata = {
  title: "API playground — Tickwise portal",
};

export default function PlaygroundPage() {
  return <Playground />;
}
