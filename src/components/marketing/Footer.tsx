import { Link } from "@tanstack/react-router";

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary text-[10px] font-mono text-primary-foreground">CP</span>
            Tickwise
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The metered API for Uniswap v4 pools and positions on Ethereum and Avalanche. Near-real-time. Built for teams that would rather build product than index chains.
          </p>
        </div>
        <FooterCol title="Product" links={[
          ["Pricing", "/pricing"],
          ["Explore", "/explore"],
          ["Status", "/status"],
          ["Changelog", "/changelog"],
        ]} />
        <FooterCol title="Developers" links={[
          ["Docs", "/docs"],
          ["Quickstart", "/docs/quickstart"],
          ["Units & limits", "/docs/units-and-limits"],
          ["Errors", "/docs/errors"],
        ]} />
        <FooterCol title="Company" links={[
          ["Contact", "/contact"],
          ["Support", "/support"],
          ["Terms", "/legal/terms"],
          ["Privacy", "/legal/privacy"],
          ["DPA", "/legal/dpa"],
        ]} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Doryoku Labs · Tickwise Dex API</div>
          <div className="font-mono">Uniswap v4 · ETH · AVAX · near-real-time</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      <ul className="space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-foreground/80 transition-colors hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
