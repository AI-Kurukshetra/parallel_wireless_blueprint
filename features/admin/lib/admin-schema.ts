import { z } from "zod";

export const tenantFormSchema = z.object({
  name: z.string().trim().min(2, "Tenant name is required."),
  slug: z.string().trim().min(2, "Tenant slug is required."),
  defaultRegion: z.string().trim().min(2, "Default region is required."),
  criticalAlarmThreshold: z.coerce.number().int().min(0, "Threshold must be at least 0."),
  isActive: z.coerce.boolean().default(true)
});

export const createUserFormSchema = z.object({
  email: z.string().trim().email("A valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().trim().min(2, "Full name is required."),
  tenantId: z.string().uuid("A tenant is required."),
  role: z.enum(["owner", "admin", "operator", "viewer"]),
  isActive: z.coerce.boolean().default(true),
  isSuperAdmin: z.coerce.boolean().default(false)
});

export const updateUserFormSchema = createUserFormSchema.omit({ password: true });

export const passwordUpdateSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the password.")
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match."
  });

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
export type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;

export type AdminFormState<TField extends string> = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<TField, string>>;
};
