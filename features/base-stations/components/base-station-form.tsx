"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Notice } from "@/components/ui/notice";
import type {
  BaseStationFormState,
  BaseStationFormValues
} from "@/features/base-stations/lib/base-station-schema";

const initialState: BaseStationFormState = {
  status: "idle"
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-700">{message}</p> : null;
}

type BaseStationFormProps = {
  action: (state: BaseStationFormState, formData: FormData) => Promise<BaseStationFormState>;
  defaultValues?: BaseStationFormValues;
  siteOptions: { label: string; value: string }[];
  submitLabel: string;
};

export function BaseStationForm({
  action,
  defaultValues,
  siteOptions,
  submitLabel
}: BaseStationFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Field label="Station code" name="code" defaultValue={defaultValues?.code} required />
          <FieldError message={state.fieldErrors?.code} />
        </div>
        <div className="space-y-2">
          <Field label="Vendor" name="vendor" defaultValue={defaultValues?.vendor} required />
          <FieldError message={state.fieldErrors?.vendor} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Site"
            name="siteId"
            options={siteOptions}
            placeholder="Select a site"
            defaultValue={defaultValues?.siteId}
            required
          />
          <FieldError message={state.fieldErrors?.siteId} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Status"
            name="status"
            options={[
              { label: "Online", value: "online" },
              { label: "Degraded", value: "degraded" },
              { label: "Offline", value: "offline" }
            ]}
            defaultValue={defaultValues?.status ?? "online"}
          />
          <FieldError message={state.fieldErrors?.status} />
        </div>
        <div className="space-y-2">
          <Field
            label="Power level %"
            name="powerLevel"
            type="number"
            defaultValue={String(defaultValues?.powerLevel ?? 0)}
            required
          />
          <FieldError message={state.fieldErrors?.powerLevel} />
        </div>
        <div className="space-y-2">
          <Field
            label="Backhaul usage %"
            name="backhaulUsage"
            type="number"
            defaultValue={String(defaultValues?.backhaulUsage ?? 0)}
            required
          />
          <FieldError message={state.fieldErrors?.backhaulUsage} />
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
