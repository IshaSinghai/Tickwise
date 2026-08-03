"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LOGIN_PATH, clearToken, type Realm } from "@/lib/auth";

/*
 * The sign-out control in both realm shells used to be a plain <Link> to the
 * login page. That navigated but cleared nothing, so with the route guards now
 * in place a "signed out" visitor could reach the portal again just by going
 * back to /portal. This clears the realm's token first — and only that realm's,
 * so signing out of the portal leaves an admin session alone.
 *
 * Renders the same Button props and icon as before, so the sidebar is unchanged.
 */
export function SignOutButton({ realm }: { realm: Realm }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={() => {
        clearToken(realm);
        router.replace(LOGIN_PATH[realm]);
      }}
    >
      <LogOut className="mr-2 h-4 w-4" /> Sign out
    </Button>
  );
}
