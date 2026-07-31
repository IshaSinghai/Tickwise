import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CMD = `curl https://api.tickwise.io/v1/pools?chain=ethereum \\
  -H "KC-APIKey: kc_live_9f2a4c8e…"`;

const RESPONSE = `{ "pools": 1284, "chain": "ethereum", "lag_s": 42 }`;

type Phase = "typing" | "sending" | "loading" | "response" | "success" | "units" | "idle";

/** Interactive terminal that loops the full request lifecycle. */
export function APITerminal({ reduce = false }: { reduce?: boolean }) {
  const [typed, setTyped] = useState(reduce ? CMD : "");
  const [phase, setPhase] = useState<Phase>(reduce ? "units" : "typing");

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    const run = () => {
      let i = 0;
      setPhase("typing");
      setTyped("");
      const type = () => {
        if (cancelled) return;
        i += 1;
        setTyped(CMD.slice(0, i));
        if (i < CMD.length) at(type, 24);
        else {
          at(() => setPhase("sending"), 520);
          at(() => setPhase("loading"), 1100);
          at(() => setPhase("response"), 2000);
          at(() => setPhase("success"), 2700);
          at(() => setPhase("units"), 3400);
          at(() => setPhase("idle"), 7200);
          at(run, 8000);
        }
      };
      at(type, 420);
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  const showResponse = phase === "response" || phase === "success" || phase === "units";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface/50 shadow-card backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="min-h-[188px] p-4 font-mono text-[12.5px] leading-relaxed md:text-sm">
        <pre className="whitespace-pre-wrap break-all text-foreground/90">
          {typed}
          {phase === "typing" && !reduce && (
            <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] animate-caret bg-primary-glow" />
          )}
        </pre>

        <AnimatePresence mode="wait">
          {(phase === "sending" || phase === "loading") && (
            <motion.div
              key="inflight"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {phase === "sending" ? "request sent · opening stream" : "loading · resolving pools"}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResponse && (
            <motion.div
              key="response"
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-3 space-y-2"
            >
              <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background/60 p-3 text-[12px] text-foreground/80">
                {RESPONSE}
              </pre>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <AnimatePresence>
                  {(phase === "success" || phase === "units") && (
                    <motion.span
                      key="ok"
                      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-success"
                    >
                      <Check className="h-3 w-3" /> 200 OK
                    </motion.span>
                  )}
                  {phase === "units" && (
                    <motion.span
                      key="units"
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary-glow"
                    >
                      <Zap className="h-3 w-3" /> 1 unit consumed
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="text-muted-foreground">142 ms</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "idle" && (
          <div className="mt-3 font-mono text-[11px] text-muted-foreground/70">idle · awaiting next call</div>
        )}
      </div>
    </div>
  );
}
