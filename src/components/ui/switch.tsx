"use client";

import * as React from "react";

import { useControllableState } from "@/components/ui/internal/use-controllable-state";
import { cn } from "@/lib/utils";

/*
 * Was @radix-ui/react-switch. A <button role="switch"> with aria-checked is the
 * whole accessibility contract here — Space/Enter activation comes free with a
 * real button, which is why this is a button and not a styled div.
 *
 * The data-state attributes are kept because the class strings are written
 * against them (data-[state=checked]:…), so the styling is unchanged.
 */

export interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "value"
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { className, checked, defaultChecked = false, onCheckedChange, disabled, ...props },
  ref,
) {
  const [isChecked, setChecked] = useControllableState(checked, defaultChecked, onCheckedChange);
  const state = isChecked ? "checked" : "unchecked";

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      data-state={state}
      onClick={() => setChecked(!isChecked)}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className,
      )}
      {...props}
    >
      <span
        data-state={state}
        className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      />
    </button>
  );
});

export { Switch };
