import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/home/AmbientBackground";
import { HeroScene } from "@/components/home/hero/HeroScene";
import { AuroraField } from "@/components/home/hero/AuroraField";
import { APITerminal } from "@/components/home/hero/APITerminal";
import { useSafeReducedMotion } from "@/components/home/hero/primitives";

import { LiveStats } from "@/components/home/LiveStats";
import { FeatureCards } from "@/components/home/FeatureCards";
import { QuickstartEditor } from "@/components/home/QuickstartEditor";
import { CoverageNetwork } from "@/components/home/CoverageNetwork";
import { TrustedBy } from "@/components/home/TrustedBy";
import { PricingBanner } from "@/components/home/PricingBanner";
import { Reveal, EASE } from "@/components/home/motion-primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tickwise — The metered API for Uniswap v4 pools & positions" },
      {
        name: "description",
        content:
          "Near-real-time Uniswap v4 pools and positions on Ethereum and Avalanche. Get an API key, ship in five minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Tickwise Dex API" },
      {
        property: "og:description",
        content:
          "Near-real-time Uniswap v4 pools and positions. Built for teams that would rather build product than index chains.",
      },
      { name: "twitter:title", content: "Tickwise Dex API" },
      {
        name: "twitter:description",
        content: "Live DeFi intelligence as one clean, metered API.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <MarketingShell>
      <AmbientBackground />
      <Hero />
      <Stats />
      <Proof />
      <Features />
      <Quickstart />
      <Coverage />
      <CTA />
    </MarketingShell>
  );
}

function Hero() {
  const reduce = useSafeReducedMotion();
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      <AuroraField />

      <div className="relative z-10 mx-auto grid w-full max-w-[1680px] grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-10 xl:gap-16 2xl:px-12">
        <div className="pointer-events-none lg:col-span-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl"
          >
            <span className="h-1.5 w-1.5 animate-ping-slow rounded-full bg-success" />
            Uniswap v4 · Ethereum &amp; Avalanche · near-real-time
          </motion.div>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,5.2vw,4.9rem)] font-semibold leading-[1.02] tracking-tight">
            {["Pools & positions", "as one clean API."].map((line, i) => (
              <motion.span
                key={line}
                className="block overflow-hidden"
                initial={reduce ? false : { opacity: 0, y: 26, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.08 + i * 0.14, ease: EASE }}
              >
                <span className={i === 0 ? "text-gradient" : undefined}>{line}</span>
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.18, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            We index Uniswap v4 so you don’t have to. Metered endpoints, honest quotas, one header of auth. Ship a
            positions dashboard, a portfolio tracker, or a research tool in an afternoon.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
            className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-primary shadow-glow transition-transform duration-300 hover:scale-[1.02]">
              <Link to="/signup">
                <span className="relative z-10 inline-flex items-center">
                  Get an API key
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border/70 bg-surface/40 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-glow"
            >
              <Link to="/docs/quickstart">Read the quickstart</Link>
            </Button>
            <Link
              to="/explore"
              className="group ml-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              or try the live data{" "}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          <motion.ul
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80"
          >
            {["1,284 v4 pools", "2 chains live", "~42s index lag", "142 ms p50"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary-glow/80" />
                {t}
              </li>
            ))}
          </motion.ul>

          {/* live shell */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 26, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
            className="pointer-events-auto relative z-10 mt-10 w-full max-w-[600px]"
          >
            <span className="absolute -top-3 left-4 z-10 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
              indexer-04 · syncing
            </span>
            <span className="absolute -bottom-3 right-5 z-10 rounded-full border border-success/40 bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-success backdrop-blur-xl">
              edge-07 · streaming
            </span>
            <div className="shadow-[0_40px_120px_-40px_color-mix(in_oklab,var(--primary)_60%,transparent)]">
              <APITerminal reduce={reduce} />
            </div>
          </motion.div>
        </div>

        {/* mobile / tablet: scene in flow */}
        <div className="relative -mx-6 h-[62vh] lg:hidden">
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, scale: 0.94, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: 0.12, ease: EASE }}
          >
            <ReactorScene />
          </motion.div>
        </div>


      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center"
      >
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-border/60 p-1">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-primary-glow"
            animate={reduce ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}


function Stats() {
  return (
    <section className="mx-auto w-full max-w-[1680px] px-6 py-10 2xl:px-12">
      <LiveStats />
    </section>
  );
}

function Proof() {
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-6 py-16">
      <TrustedBy />
    </Reveal>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal className="max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-primary">Why teams pick Tickwise</div>
        <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
          Boring where boring matters. Fast where it doesn’t.
        </h2>
      </Reveal>
      <div className="mt-12">
        <FeatureCards />
      </div>
    </section>
  );
}

function Quickstart() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-5">
          <div className="text-xs uppercase tracking-widest text-primary">Five-minute quickstart</div>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
            One header. Real data.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Sign up, create a key in the portal, drop this into your terminal. If the response returns pools, you’re
            done.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="group relative overflow-hidden bg-gradient-primary shadow-glow">
              <Link to="/signup">
                <span className="relative z-10">Get a free key</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border/70 bg-surface/40 backdrop-blur hover:border-primary/50">
              <Link to="/docs/quickstart">Full quickstart</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7" delay={0.1}>
          <QuickstartEditor />
        </Reveal>
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-6 py-24">
      <CoverageNetwork />
    </Reveal>
  );
}

function CTA() {
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-6 pb-24">
      <PricingBanner />
    </Reveal>
  );
}
