"use client";

import { useState } from "react";

import { Card } from "@/components/portal/Card";
import { InlineError, SkeletonBlock } from "@/components/DataState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ThemeSetting } from "@/components/ThemeSetting";
import { getAccountProfile } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import type { AccountProfile } from "@/lib/mock";

/*
 * Account settings, with the profile from GET /account/profile through lib/api.
 *
 * The name and billing email were `defaultValue="Alex Rivera"` and
 * `defaultValue="alex@doryoku.io"` — invented, uncontrolled, and presented to the
 * visitor as their own account. They come from the endpoint now and the inputs are
 * controlled.
 *
 * The three writes on this page (save profile, change password, delete account) all
 * need endpoints that are backend-planned. None of them reports a success it hasn't
 * had; each says what it needs, the same way /admin/plans does. A "Saved" toast over
 * a stub would be worse here than anywhere else on the site, because the next thing
 * the customer does is close the tab believing their billing email changed.
 */
const NEEDS_ACCOUNT_API = "needs the account API, which isn’t wired up yet.";

export function Settings() {
  const { status, data, error, retry } = useAsync<AccountProfile>(
    (signal) => getAccountProfile(signal),
    "Could not load your profile.",
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <Card>
          <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            Profile
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </div>
        </Card>
      ) : (
        <ProfileCard profile={data} />
      )}

      <Card>
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          Appearance
        </div>
        <ThemeSetting />
      </Card>

      <Card>
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Password</div>
        <PasswordFields />
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => toast.error(`Changing your password ${NEEDS_ACCOUNT_API}`)}
          >
            Change password
          </Button>
        </div>
      </Card>

      <Card className="border-destructive/40">
        <div className="mb-2 text-xs uppercase tracking-widest text-destructive">Danger zone</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Delete account</div>
            <div className="text-sm text-muted-foreground">
              Permanent. All keys revoked. Cannot be undone.
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => toast.error(`Deleting an account ${NEEDS_ACCOUNT_API}`)}
          >
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ProfileCard({ profile }: { profile: AccountProfile }) {
  const [name, setName] = useState(profile.name);
  const [billingEmail, setBillingEmail] = useState(profile.billingEmail);
  const dirty = name !== profile.name || billingEmail !== profile.billingEmail;

  return (
    <Card>
      <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Profile</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          label="Billing email"
          type="email"
          value={billingEmail}
          onChange={(e) => setBillingEmail(e.target.value)}
        />
      </div>
      {dirty && (
        <div className="mt-4 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-muted-foreground">
          Changes are local — saving your profile needs the account API, which isn’t wired up yet.
        </div>
      )}
      <div className="mt-4">
        <Button
          className="bg-gradient-primary"
          onClick={() => toast.error(`Saving your profile ${NEEDS_ACCOUNT_API}`)}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

/** Local-only, and never sent anywhere while the endpoint is planned. */
function PasswordFields() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="Current"
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Field label="New" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
    </div>
  );
}

/*
 * Same markup as before — a block label above the input, not wrapped around it, so
 * the spacing is unchanged. What's new is `htmlFor`/`id`: the label was previously
 * unassociated, which left every field on this page unnamed to a screen reader.
 */
function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `settings-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <Input id={id} {...p} />
    </div>
  );
}
