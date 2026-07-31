import type { Metadata } from "next";
import { Card } from "@/components/portal/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input {...p} />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Settings — Tickwise portal",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <Card>
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Profile</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" defaultValue="Alex Rivera" />
          <Field label="Billing email" defaultValue="alex@doryoku.io" />
        </div>
        <div className="mt-4"><Button className="bg-gradient-primary">Save</Button></div>
      </Card>
      <Card>
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Password</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Current" type="password" />
          <Field label="New" type="password" />
        </div>
        <div className="mt-4"><Button variant="outline">Change password</Button></div>
      </Card>
      <Card className="border-destructive/40">
        <div className="mb-2 text-xs uppercase tracking-widest text-destructive">Danger zone</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Delete account</div>
            <div className="text-sm text-muted-foreground">Permanent. All keys revoked. Cannot be undone.</div>
          </div>
          <Button variant="destructive">Delete account</Button>
        </div>
      </Card>
    </div>
  );
}
