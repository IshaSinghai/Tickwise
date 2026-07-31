import type { Metadata } from "next";

import { Login } from "./login-view";

export const metadata: Metadata = {
  title: "Sign in — Tickwise",
  description: "Sign in to your Tickwise developer portal.",
};

export default function LoginPage() {
  return <Login />;
}
