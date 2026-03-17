"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Notice } from "@/components/ui/notice";
import type { SiteFormState, SiteFormValues } from "@/features/sites/lib/site-schema";

const initialState: SiteFormState = {
  status: "idle"
};

const statusOptions = [
  { label: "Online", value: "online" },
  { label: "Degraded", value: "degraded" },
  { label: "Offline", value: "offline" }
];

type SiteFormProps = {
  action: (state: SiteFormState, formData: FormData) => Promise<SiteFormState>;
  defaultValues?: SiteFormValues;
  submitLabel: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-700">{message}</p> : null;
}

export function SiteForm({ action, defaultValues, submitLabel }: SiteFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Field label="Site name" name="name" defaultValue={defaultValues?.name} required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div className="space-y-2">
          <Field label="Site code" name="code" defaultValue={defaultValues?.code} required />
          <FieldError message={state.fieldErrors?.code} />
        </div>
        <div className="space-y-2">
          <Field label="Region" name="region" defaultValue={defaultValues?.region} required />
          <FieldError message={state.fieldErrors?.region} />
        </div>
        <div className="space-y-2">
          <Field label="Technology" name="technology" defaultValue={defaultValues?.technology} required />
          <FieldError message={state.fieldErrors?.technology} />
        </div>
        <div className="space-y-2">
          <Field label="Uptime %" name="uptime" type="number" step="0.1" defaultValue={String(defaultValues?.uptime ?? 0)} required />
          <FieldError message={state.fieldErrors?.uptime} />
        </div>
        <div className="space-y-2">
          <Field
            label="Subscribers"
            name="subscribers"
            type="number"
            defaultValue={String(defaultValues?.subscribers ?? 0)}
            required
          />
          <FieldError message={state.fieldErrors?.subscribers} />
        </div>
        <div className="space-y-2">
          <Field
            label="Coverage %"
            name="coveragePercent"
            type="number"
            defaultValue={String(defaultValues?.coveragePercent ?? 0)}
            required
          />
          <FieldError message={state.fieldErrors?.coveragePercent} />
        </div>
        <div className="space-y-2">
          <Field
            label="Monthly energy cost (USD)"
            name="monthlyEnergyCost"
            type="number"
            step="0.01"
            defaultValue={String(defaultValues?.monthlyEnergyCost ?? 0)}
            required
          />
          <FieldError message={state.fieldErrors?.monthlyEnergyCost} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Status"
            name="status"
            defaultValue={defaultValues?.status ?? "online"}
            options={statusOptions}
          />
          <FieldError message={state.fieldErrors?.status} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Availability"
            name="isActive"
            defaultValue={defaultValues?.isActive === false ? "false" : "true"}
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" }
            ]}
          />
        </div>
      </div>
      {state.message ? (
        <Notice tone="error">{state.message}</Notice>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
