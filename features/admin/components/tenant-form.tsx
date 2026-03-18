"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Notice } from "@/components/ui/notice";
import type { AdminFormState, TenantFormValues } from "@/features/admin/lib/admin-schema";

const initialState: AdminFormState<keyof TenantFormValues> = {
  status: "idle"
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-700">{message}</p> : null;
}

export function TenantForm({
  action,
  defaultValues,
  submitLabel
}: {
  action: (state: AdminFormState<keyof TenantFormValues>, formData: FormData) => Promise<AdminFormState<keyof TenantFormValues>>;
  defaultValues?: Partial<TenantFormValues>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Field label="Tenant name" name="name" defaultValue={defaultValues?.name} required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div className="space-y-2">
          <Field label="Tenant slug" name="slug" defaultValue={defaultValues?.slug} required />
          <FieldError message={state.fieldErrors?.slug} />
        </div>
        <div className="space-y-2">
          <Field label="Default region" name="defaultRegion" defaultValue={defaultValues?.defaultRegion} required />
          <FieldError message={state.fieldErrors?.defaultRegion} />
        </div>
        <div className="space-y-2">
          <Field
            label="Critical alarm threshold"
            name="criticalAlarmThreshold"
            type="number"
            defaultValue={String(defaultValues?.criticalAlarmThreshold ?? 10)}
            required
          />
          <FieldError message={state.fieldErrors?.criticalAlarmThreshold} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Tenant status"
            name="isActive"
            defaultValue={defaultValues?.isActive === false ? "false" : "true"}
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" }
            ]}
          />
        </div>
      </div>
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}
      <SubmitButton pendingLabel="Saving tenant...">{submitLabel}</SubmitButton>
    </form>
  );
}
