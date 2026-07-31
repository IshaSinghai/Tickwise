import type { Metadata } from "next";

import { Signup } from "./signup-view";

export const metadata: Metadata = {
  title: "Create your account — Tickwise",
  description: "Sign up in 30 seconds. Free tier includes 25,000 units/month.",
};

export default function SignupPage() {
  return <Signup />;
}
