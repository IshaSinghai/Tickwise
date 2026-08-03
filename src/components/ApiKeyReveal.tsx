"use client";

import { AlertTriangle, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export function ApiKeyReveal({
  open,
  onDismiss,
  fullKey,
  label,
}: {
  open: boolean;
  onDismiss: () => void;
  fullKey: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const [ack, setAck] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullKey);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && ack && onDismiss()}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
            Your new API key
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            <div className="font-medium text-foreground">
              This is the only time you will see this key.
            </div>
            <div className="mt-1 text-muted-foreground">
              We store only its hash. If you lose it, you must revoke and create a new one.
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-sm break-all">
              <span className="flex-1">{fullKey}</span>
              <Button size="sm" variant="ghost" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-1 accent-[color:var(--primary)]"
            />
            I have saved this key somewhere safe.
          </label>
        </div>
        <DialogFooter>
          <Button disabled={!ack} onClick={onDismiss} className="bg-gradient-primary">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
