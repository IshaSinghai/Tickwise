"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border/60 bg-[color:var(--surface-2)]">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5 text-[0.6875rem] uppercase tracking-widest text-muted-foreground">
        <span className="font-mono">{lang}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 gap-1 px-2 text-xs"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "copied" : "copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
