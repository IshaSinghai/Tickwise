import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Authentication — Tickwise docs",
  description: "Server vs browser keys, allowed origins, key rotation.",
};

export default function AuthenticationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Getting started</div>
        <h1 className="font-display text-4xl font-semibold">Authentication</h1>
        <p className="text-muted-foreground">One header. Two key types. Pick the right one at creation time — you can’t change it later.</p>
      </div>
      <CodeBlock lang="http" code={`GET /v1/pools\nKC-APIKey: kc_live_9f2a4c8e…`} />

      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <div className="font-medium">The rule that trips everyone up</div>
        <div className="mt-1 text-muted-foreground">
          A <strong>server key</strong> is rejected with <code>403</code> if the request carries an <code>Origin</code> header — meaning the browser sent it.
          A <strong>browser key</strong> requires at least one allowed origin, and is rejected from any other site.
        </div>
      </div>

      <h2 className="font-display text-2xl font-semibold">Server keys</h2>
      <p className="text-sm text-muted-foreground">Server-to-server only. Never ship these to a browser bundle. If you see a 403 with reason <code>server_key_from_browser</code>, this is why.</p>

      <h2 className="font-display text-2xl font-semibold">Browser keys</h2>
      <p className="text-sm text-muted-foreground">Safe to embed in frontend bundles. Set the exact origins you use — <code>https://app.example.com</code>, no wildcards, no protocol mismatches.</p>
      <CodeBlock code={`allowed_origins:\n  - https://app.example.com\n  - https://staging.example.com`} lang="yaml" />

      <h2 className="font-display text-2xl font-semibold">Rotation</h2>
      <p className="text-sm text-muted-foreground">Create the new key, deploy it, revoke the old one. Revoked keys 401 immediately.</p>
    </div>
  );
}
