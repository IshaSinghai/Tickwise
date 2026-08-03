"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useState } from "react";


export function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-primary">Contact</div>
        <h1 className="mt-2 font-display text-4xl font-semibold">Talk to a human</h1>
        <p className="mt-2 text-muted-foreground">Enterprise plans, custom chain requests, bespoke SLAs. We reply within one business day.</p>
        <form
          className="mt-10 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSending(true);
            setTimeout(() => {
              setSending(false);
              toast.success("Thanks — we’ll be in touch shortly.");
              (e.currentTarget as HTMLFormElement).reset();
            }, 700);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Work email" name="email" type="email" required />
          </div>
          <Field label="Company" name="company" />
          <Field label="Estimated monthly units" name="units" placeholder="e.g. 5,000,000" />
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">What are you building?</label>
            <Textarea name="message" rows={5} required />
          </div>
          <div>
            <Button disabled={sending} className="bg-gradient-primary">{sending ? "Sending…" : "Send"}</Button>
          </div>
        </form>
      </div>
    </MarketingShell>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input {...props} />
    </div>
  );
}
