"use client";

import { Card } from "@/components/portal/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ApiKeyReveal } from "@/components/ApiKeyReveal";
import { useEffect, useState } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ApiError, createAccountKey, getAccountKeys, revokeAccountKey } from "@/lib/api";
import type { ApiKey } from "@/lib/mock";

export function Keys() {
  // useEffect + the typed fetch wrapper, per the brief — no data-fetching library.
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [reveal, setReveal] = useState<{ key: string; label: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAccountKeys(controller.signal)
      .then(setKeys)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load your API keys.");
      });
    return () => controller.abort();
  }, []);

  const revoke = async (id: string) => {
    try {
      await revokeAccountKey(id);
      setKeys((ks) => (ks ?? []).filter((x) => x.id !== id));
      toast.success("Key revoked");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not revoke that key.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">API keys</h1>
          <p className="text-sm text-muted-foreground">
            Server keys for backends, browser keys for frontends. You can’t change the type after
            creation.
          </p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" /> New key
        </Button>
      </div>
      <Card>
        {/* All four list states the brief requires: loading, error, empty, populated. */}
        {loadError ? (
          <div className="py-4 text-sm text-destructive">{loadError}</div>
        ) : keys === null ? (
          <ul className="divide-y divide-border/60">
            {[0, 1].map((i) => (
              <li key={i} className="flex items-center gap-3 py-4">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                </div>
              </li>
            ))}
          </ul>
        ) : keys.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-sm font-medium">No API keys yet</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one to make your first request.
            </p>
            <Button className="mt-4 bg-gradient-primary" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> New key
            </Button>
          </div>
        ) : (
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
                          <span
                            key={o}
                            className="rounded border border-border/60 bg-surface-2 px-1.5 py-0.5 font-mono text-[0.625rem]"
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[0.625rem] ${k.type === "server" ? "border-primary/40 bg-primary/10 text-primary" : "border-warning/40 bg-warning/10 text-warning"}`}
                  >
                    {k.type}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => void revoke(k.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CreateKey
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={async (label, type) => {
          try {
            const { apiKey, secret } = await createAccountKey({ label, type });
            setKeys((ks) => [apiKey, ...(ks ?? [])]);
            setCreating(false);
            // The secret comes back exactly once, so it goes straight to the
            // reveal dialog and is never kept in the list.
            setReveal({ key: secret, label });
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not create that key.");
          }
        }}
      />
      {reveal && (
        <ApiKeyReveal
          open
          onDismiss={() => setReveal(null)}
          fullKey={reveal.key}
          label={reveal.label}
        />
      )}
    </div>
  );
}

function CreateKey({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (label: string, type: "server" | "browser") => void;
}) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"server" | "browser">("server");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Label
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Production · server"
            />
          </div>
          <RadioGroup
            value={type}
            onValueChange={(v) => setType(v as "server" | "browser")}
            className="space-y-2"
          >
            <KeyOption
              value="server"
              title="Server key"
              desc="For backend-to-backend. Rejected with 403 from any browser (Origin header present)."
              checked={type === "server"}
            />
            <KeyOption
              value="browser"
              title="Browser key"
              desc="For frontends. Requires at least one allowed origin. Can’t be changed to server later."
              checked={type === "browser"}
            />
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-primary"
            disabled={!label}
            onClick={() => onCreated(label, type)}
          >
            Create key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KeyOption({
  value,
  title,
  desc,
  checked,
}: {
  value: string;
  title: string;
  desc: string;
  checked: boolean;
}) {
  return (
    <Label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${checked ? "border-primary/60 bg-primary/5" : "border-border/60"}`}
    >
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </Label>
  );
}
