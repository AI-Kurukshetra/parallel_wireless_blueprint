import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const tones = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-accent/20 bg-accent/10 text-accent"
};

export function Notice({
  tone = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof tones;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn("rounded-2xl border px-4 py-3 text-sm", tones[tone], className)}
      {...props}
    />
  );
}
