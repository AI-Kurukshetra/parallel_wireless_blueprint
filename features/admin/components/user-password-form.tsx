"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Notice } from "@/components/ui/notice";
import type { AdminFormState, PasswordUpdateValues } from "@/features/admin/lib/admin-schema";

const initialState: AdminFormState<keyof PasswordUpdateValues> = {
  status: "idle"
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-700">{message}</p> : null;
}

export function UserPasswordForm({
  action
}: {
  action: (
    state: AdminFormState<keyof PasswordUpdateValues>,
    formData: FormData
  ) => Promise<AdminFormState<keyof PasswordUpdateValues>>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="space-y-2">
        <Field label="New password" name="password" type="password" required />
        <FieldError message={state.fieldErrors?.password} />
      </div>
      <div className="space-y-2">
        <Field label="Confirm password" name="confirmPassword" type="password" required />
        <FieldError message={state.fieldErrors?.confirmPassword} />
      </div>
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}
      <SubmitButton pendingLabel="Updating password...">Update Password</SubmitButton>
    </form>
  );
}
