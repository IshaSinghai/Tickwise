"use client";

import { Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Was @radix-ui/react-radio-group.
 *
 * Built on native <input type="radio"> sharing a `name`, which gives the whole
 * accessibility contract for free and slightly better than the Radix version
 * did: correct radiogroup/radio roles, roving focus, and — unlike the previous
 * implementation — arrow keys that also move the *selection*, which is what a
 * screen-reader user expects from a radio group.
 *
 * The input is visually hidden but still the real focus target and hit area, so
 * the ring and checked styles hang off `peer-*` variants of it rather than being
 * driven by data-state attributes.
 */

type RadioGroupContextValue = {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
};
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export function RadioGroup({
  value,
  onValueChange,
  className,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  // A generated name groups the inputs so the browser treats them as one radio
  // group, without colliding with any other group on the page.
  const name = React.useId();

  return (
    <RadioGroupContext.Provider value={{ name, value, onValueChange }}>
      {/* role="radiogroup" is stated explicitly: a plain <div> wrapper around
          native radios is not announced as a group otherwise. */}
      <div role="radiogroup" className={cn("grid gap-2", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  className,
  disabled,
}: {
  value: string;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) throw new Error("<RadioGroupItem> must be rendered inside <RadioGroup>");

  const checked = ctx.value === value;

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => ctx.onValueChange(value)}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden="true"
        className="flex aspect-square h-4 w-4 items-center justify-center rounded-full border border-primary text-primary shadow peer-focus-visible:ring-1 peer-focus-visible:ring-ring peer-disabled:opacity-50"
      >
        {checked && <Circle className="h-3.5 w-3.5 fill-primary" />}
      </span>
    </span>
  );
}
