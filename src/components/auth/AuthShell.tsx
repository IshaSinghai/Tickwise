import Link from "next/link";
import { Input } from "@/components/ui/input";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow"><span className="font-mono text-xs">CP</span></span>
          Tickwise
        </Link>
        <div className="rounded-2xl border border-border/60 bg-surface p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input {...props} />
    </div>
  );
}
