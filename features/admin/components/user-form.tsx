"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Notice } from "@/components/ui/notice";
import type {
  AdminFormState,
  CreateUserFormValues,
  UpdateUserFormValues
} from "@/features/admin/lib/admin-schema";

type UserFormValues = Partial<CreateUserFormValues & UpdateUserFormValues>;

const initialState: AdminFormState<string> = {
  status: "idle"
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-700">{message}</p> : null;
}

export function UserForm({
  action,
  defaultValues,
  tenantOptions,
  submitLabel,
  includePassword = false
}: {
  action: (state: AdminFormState<string>, formData: FormData) => Promise<AdminFormState<string>>;
  defaultValues?: UserFormValues;
  tenantOptions: { value: string; label: string }[];
  submitLabel: string;
  includePassword?: boolean;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Field label="Full name" name="fullName" defaultValue={defaultValues?.fullName} required />
          <FieldError message={state.fieldErrors?.fullName} />
        </div>
        <div className="space-y-2">
          <Field label="Email" name="email" type="email" defaultValue={defaultValues?.email} required />
          <FieldError message={state.fieldErrors?.email} />
        </div>
        {includePassword ? (
          <div className="space-y-2">
            <Field label="Temporary password" name="password" type="password" required />
            <FieldError message={state.fieldErrors?.password} />
          </div>
        ) : null}
        <div className="space-y-2">
          <SelectField
            label="Tenant"
            name="tenantId"
            options={tenantOptions}
            defaultValue={defaultValues?.tenantId}
            placeholder="Select tenant"
            required
          />
          <FieldError message={state.fieldErrors?.tenantId} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Role"
            name="role"
            defaultValue={defaultValues?.role ?? "operator"}
            options={[
              { label: "Owner", value: "owner" },
              { label: "Admin", value: "admin" },
              { label: "Operator", value: "operator" },
              { label: "Viewer", value: "viewer" }
            ]}
          />
          <FieldError message={state.fieldErrors?.role} />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Profile status"
            name="isActive"
            defaultValue={defaultValues?.isActive === false ? "false" : "true"}
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" }
            ]}
          />
        </div>
        <div className="space-y-2">
          <SelectField
            label="Super admin"
            name="isSuperAdmin"
            defaultValue={defaultValues?.isSuperAdmin ? "true" : "false"}
            options={[
              { label: "No", value: "false" },
              { label: "Yes", value: "true" }
            ]}
          />
        </div>
      </div>
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}
      <SubmitButton pendingLabel="Saving user...">{submitLabel}</SubmitButton>
    </form>
  );
}
