"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

/*
 * Previously wrapped the whole app in @tanstack/react-query's
 * QueryClientProvider. Nothing ever used it — there was not a single useQuery,
 * useMutation or useQueryClient call anywhere in src — so it was shipping a
 * data-fetching library to every route to provide a context no component read.
 * The brief specifies useEffect plus a typed fetch wrapper for data access, so
 * there is nothing to replace it with; when real fetching lands it goes through
 * that wrapper.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
