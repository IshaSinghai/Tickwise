"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
];

/*
 * The theme control.
 *
 * A segmented pair rather than an icon toggle in the site header: the header is
 * on every public page and adding a control there is a visible change to the
 * marketing design, which is outside a compliance pass. Settings is where the
 * brief already puts account preferences, so it lands there and the rest of the
 * site simply follows `data-theme`.
 *
 * Built from the same border/surface/gradient tokens as the pricing cycle toggle
 * so it reads as existing furniture rather than something new.
 */
export function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">Appearance</div>
          <div className="text-sm text-muted-foreground">
            Applies to this browser and is remembered on your next visit.
          </div>
        </div>
      </div>
      <div
        role="radiogroup"
        aria-label="Appearance"
        className="inline-flex shrink-0 rounded-full border border-border/60 bg-surface p-1 text-sm"
      >
        {OPTIONS.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(o.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors ${
                active
                  ? "bg-gradient-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <o.icon className="h-3.5 w-3.5" />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
