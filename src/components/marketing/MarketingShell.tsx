import type { ReactNode } from "react";
import { MarketingHeader } from "./Header";
import { MarketingFooter } from "./Footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
