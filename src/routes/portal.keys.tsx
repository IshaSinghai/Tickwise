import { createFileRoute } from "@tanstack/react-router";
import { Card } from "./portal.index";
import { MOCK_KEYS } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ApiKeyReveal } from "@/components/ApiKeyReveal";
import { useState } from "react";
import { KeyRound, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/keys")({
  head: () => ({ meta: [{ title: "API keys — Tickwise portal" }] }),
  component: Keys,
});

function Keys() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [creating, setCreating] = useState(false);
  const [reveal, setReveal] = useState<{ key: string; label: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">API keys</h1>
          <p className="text-sm text-muted-foreground">Server keys for backends, browser keys for frontends. You can’t change the type after creation.</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => setCreating(true)}><Plus className="mr-1 h-4 w-4" /> New key</Button>
      </div>
      <Card>
        <ul className="divide-y divide-border/60">
          {keys.map((k) => (
            <li key={k.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-3">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{k.label}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{k.prefix}…</span>
                    <span>· created {k.createdAt}</span>
                    <span>· last used {k.lastUsed ?? "never"}</span>
                  </div>
                  {k.type === "browser" && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {k.origins.map((o) => (
                        <span key={o} className="rounded border border-border/60 bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">{o}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${k.type === "server" ? "border-primary/40 bg-primary/10 text-primary" : "border-warning/40 bg-warning/10 text-warning"}`}>{k.type}</span>
                <Button size="sm" variant="ghost" onClick={() => { setKeys((ks) => ks.filter((x) => x.id !== k.id)); toast.success("Key revoked"); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <CreateKey
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(label, type) => {
          const prefix = "kc_live_" + Math.random().toString(36).slice(2, 18);
          const fullKey = prefix + "_" + Math.random().toString(36).slice(2, 32);
          setKeys((ks) => [{ id: crypto.randomUUID(), label, prefix, type, origins: [], createdAt: new Date().toISOString().slice(0, 10), lastUsed: null }, ...ks]);
          setCreating(false);
          setReveal({ key: fullKey, label });
        }}
      />
      {reveal && <ApiKeyReveal open onDismiss={() => setReveal(null)} fullKey={reveal.key} label={reveal.label} />}
    </div>
  );
}

function CreateKey({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (label: string, type: "server" | "browser") => void }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"server" | "browser">("server");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create API key</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Production · server" />
          </div>
          <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="space-y-2">
            <KeyOption value="server" title="Server key" desc="For backend-to-backend. Rejected with 403 from any browser (Origin header present)." checked={type === "server"} />
            <KeyOption value="browser" title="Browser key" desc="For frontends. Requires at least one allowed origin. Can’t be changed to server later." checked={type === "browser"} />
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-primary" disabled={!label} onClick={() => onCreated(label, type)}>Create key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KeyOption({ value, title, desc, checked }: { value: string; title: string; desc: string; checked: boolean }) {
  return (
    <Label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${checked ? "border-primary/60 bg-primary/5" : "border-border/60"}`}>
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </Label>
  );
}
