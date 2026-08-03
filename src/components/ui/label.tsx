"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Was @radix-ui/react-label. Radix's value there is forwarding a click on the
 * label to its associated control, which a native <label> already does for a
 * control nested inside it — and the one real call site (the key-type options in
 * portal/keys) nests a radio inside the label with no htmlFor/id indirection.
 * So the primitive bought nothing this needs, and a native element is a strict
 * behavioural match.
 */
const LABEL_CLASSES =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...props }, ref) {
    return <label ref={ref} className={cn(LABEL_CLASSES, className)} {...props} />;
  },
);

export { Label };
