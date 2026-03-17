import { InputHTMLAttributes } from "react";

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-ink/70">
      <span className="font-medium text-ink">{label}</span>
      <input
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
        {...props}
      />
    </label>
  );
}
