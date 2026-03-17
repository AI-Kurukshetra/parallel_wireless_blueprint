import { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

export function SelectField({
  label,
  options,
  placeholder,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink/70">
      <span className="font-medium text-ink">{label}</span>
      <select
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
