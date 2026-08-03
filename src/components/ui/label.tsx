"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

// Was a cva() call with a single static string and no variants defined, so the
// class list is inlined directly. The Radix primitive is replaced in a later
// phase; this change is only about dropping class-variance-authority.
const LABEL_CLASSES =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(LABEL_CLASSES, className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
