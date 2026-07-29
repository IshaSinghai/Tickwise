import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/docs/")({
  component: DocsHome,
});

function DocsHome() {
  return (
    <div className="prose prose-invert max-w-none space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Documentation</div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Tickwise Dex API</h1>
        <p className="text-muted-foreground">
          A metered read API for Uniswap v4 pools and positions on Ethereum and Avalanche. One header of auth,
          near-real-time data, honest quotas. If a page says something we don’t do, treat that as a bug.
        </p>
      </div>

      <div>
        <h2 className="mt-8 font-display text-2xl font-semibold">Base URL</h2>
        <CodeBlock code="https://api.tickwise.io/v1" lang="text" />
      </div>

      <div>
        <h2 className="mt-8 font-display text-2xl font-semibold">Five minutes to first response</h2>
        <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
          <li><Link to="/signup" className="text-primary hover:underline">Create a free account</Link>.</li>
          <li>Head to <span className="font-mono">/portal/keys</span> and create a <em>server key</em>.</li>
          <li>Copy it once — we only store its hash.</li>
          <li>Paste the curl below into a terminal.</li>
        </ol>
        <CodeBlock code={`curl https://api.tickwise.io/v1/pools?chain=ethereum \\\n  -H "KC-APIKey: kc_live_…"`} />
      </div>

      <div>
        <h2 className="mt-8 font-display text-2xl font-semibold">Where to next</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            ["/docs/quickstart", "Quickstart", "First request, response shape, headers"],
            ["/docs/authentication", "Authentication", "Server vs browser keys, allowed origins"],
            ["/docs/units-and-limits", "Units & limits", "What a unit is, per-endpoint costs, 429s"],
            ["/docs/errors", "Errors", "Every status code and what to do about it"],
          ].map(([to, title, desc]) => (
            <li key={to}>
              <Link to={to} className="block rounded-xl border border-border/60 bg-surface p-4 transition-colors hover:border-primary/40">
                <div className="font-medium text-foreground">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
