"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LOGIN_PATH, getToken, isRealmPublicPath, type Realm } from "@/lib/auth";

/*
 * Route guard for an authenticated realm.
 *
 * The check runs in an effect rather than during render because localStorage
 * doesn't exist on the server: reading it during render would either crash SSR
 * or produce a hydration mismatch. So the first paint is deliberately a neutral
 * placeholder, and one of two things happens immediately after hydration —
 * the content renders, or we redirect. Protected content is never painted for
 * an unauthenticated visitor.
 *
 * This is exactly the shape the brief specifies ("layouts guard routes in a
 * useEffect and redirect. There is no middleware.ts"). It is a client-side
 * guard, so it hides UI rather than protecting data — the API is what enforces
 * access, and every request carries the realm's token.
 */
export function RealmGuard({ realm, children }: { realm: Realm; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  const isPublic = isRealmPublicPath(realm, pathname ?? "");

  useEffect(() => {
    if (isPublic) {
      setStatus("allowed");
      return;
    }
    if (getToken(realm)) {
      setStatus("allowed");
      return;
    }
    // replace(), not push(), so Back doesn't bounce between login and a page
    // the visitor still can't see.
    router.replace(LOGIN_PATH[realm]);
  }, [realm, router, isPublic, pathname]);

  if (status === "checking") {
    // Matches the app background so the pre-hydration frame reads as loading
    // rather than as a broken page.
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  return <>{children}</>;
}
