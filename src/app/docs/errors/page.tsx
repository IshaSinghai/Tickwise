import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Errors — Tickwise docs",
  description: "Every HTTP status code the API returns and what to do about it.",
};

export default function ErrorsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Errors</h1>
      <p className="text-muted-foreground">
        Every error is a JSON body with a code and a human message. We never return HTML.
      </p>
      <CodeBlock
        lang="json"
        code={`{\n  "error": {\n    "code": "server_key_from_browser",\n    "message": "This is a server key; requests must not include an Origin header.",\n    "status": 403\n  }\n}`}
      />
      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Meaning</th>
              <th className="px-4 py-2 font-medium">Fix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {[
              ["400", "Bad request", "Check query params; version must be v4."],
              ["401", "Missing or invalid key", "Send KC-APIKey header. Rotate if leaked."],
              [
                "403",
                "Wrong key type or origin",
                "Server key used from a browser, or browser key on a non-allowed origin.",
              ],
              ["404", "Not found", "The pool or position id doesn’t exist on this chain."],
              [
                "429",
                "Rate or quota exhausted",
                "Read X-RateLimit-Reason to distinguish. Slow down or upgrade.",
              ],
              ["5xx", "Our fault", "Retry with backoff. If persistent, check /status."],
            ].map(([s, m, f]) => (
              <tr key={s}>
                <td className="px-4 py-2 font-mono">{s}</td>
                <td className="px-4 py-2">{m}</td>
                <td className="px-4 py-2 text-muted-foreground">{f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
