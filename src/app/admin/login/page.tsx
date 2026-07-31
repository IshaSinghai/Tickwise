import type { Metadata } from "next";

import { AdminLogin } from "./login-view";

export const metadata: Metadata = {
  title: "Admin sign in — Tickwise",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
