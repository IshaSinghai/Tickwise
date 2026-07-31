import { useEffect, useState } from "react";
import { useSafeReducedMotion } from "@/components/home/hero/primitives";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CMD = `curl https://api.tickwise.io/v1/pools?chain=ethereum \\
  -H "KC-APIKey: kc_live_9f2a4c8e…"`;

const RESPONSE = `{ "pools": 1284, "units": 1, "lag_s": 42 }`;

type Phase = "typing" | "sending" | "done";

/** Premium terminal: types the request, sends it, resolves, loops. */
export function TerminalCurl() {
  const reduce = useSafeReducedMotion();
  const [typed, setTyped] = useState(reduce ? CMD : "");
  const [phase, setPhase] = useState<Phase>(reduce ? "done" : "typing");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      i = 0;
      setPhase("typing");
      setTyped("");
      const type = () => {
        if (cancelled) return;
        i += 1;
        setTyped(CMD.slice(0, i));
        if (i < CMD.length) timers.push(setTimeout(type, 26));
        else {
          timers.push(
            setTimeout(() => {
              setPhase("sending");
              timers.push(
                setTimeout(() => {
                  setPhase("done");
                  timers.push(setTimeout(run, 5200));
                }, 1100),
              );
            }, 700),
          );
        }
      };
      timers.push(setTimeout(type, 500));
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface/50 shadow-card backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-destructive/70" />
          <span className="h-2 w-2 rounded-full bg-warning/70" />
          <span className="h-2 w-2 rounded-full bg-success/70" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            bash — tickwise
          </span>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(CMD);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>

      <div className="p-4 font-mono text-[12.5px] leading-relaxed md:text-sm">
        <pre className="whitespace-pre-wrap break-all text-foreground/90">
          <span className="text-primary-glow">$ </span>
          {typed}
          {phase === "typing" && !reduce && <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] animate-caret bg-primary-glow" />}
        </pre>

        <AnimatePresence mode="wait">
          {phase === "sending" && (
            <motion.div
              key="sending"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              request in flight · resolving pools
            </motion.div>
          )}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-3 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-success">
                  <Check className="h-3 w-3" /> 200 OK
                </span>
                <span className="text-muted-foreground">142 ms</span>
                <span className="text-muted-foreground">1 unit</span>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background/60 p-3 text-[12px] text-foreground/80">
                {RESPONSE}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
