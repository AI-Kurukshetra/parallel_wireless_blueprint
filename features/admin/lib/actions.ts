"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperAdminAccess } from "@/lib/auth/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createUserFormSchema,
  passwordUpdateSchema,
  tenantFormSchema,
  updateUserFormSchema,
  type AdminFormState,
  type CreateUserFormValues,
  type PasswordUpdateValues,
  type TenantFormValues,
  type UpdateUserFormValues
} from "@/features/admin/lib/admin-schema";
import type { Database } from "@/types/database";

type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
type TenantUpdate = Database["public"]["Tables"]["tenants"]["Update"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

type TenantFormState = AdminFormState<keyof TenantFormValues>;
type CreateUserFormState = AdminFormState<keyof CreateUserFormValues>;
type UpdateUserFormState = AdminFormState<keyof UpdateUserFormValues>;
type PasswordUpdateState = AdminFormState<keyof PasswordUpdateValues>;

function buildErrorState<TField extends string>(message: string, fieldErrors?: Partial<Record<TField, string>>) {
  return {
    status: "error" as const,
    message,
    fieldErrors
  };
}

function parseTenantFormData(formData: FormData) {
  return tenantFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    defaultRegion: formData.get("defaultRegion"),
    criticalAlarmThreshold: formData.get("criticalAlarmThreshold"),
    isActive: formData.get("isActive") === "true"
  });
}

function parseCreateUserFormData(formData: FormData) {
  return createUserFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    tenantId: formData.get("tenantId"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
    isSuperAdmin: formData.get("isSuperAdmin") === "true"
  });
}

function parseUpdateUserFormData(formData: FormData) {
  return updateUserFormSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    tenantId: formData.get("tenantId"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
    isSuperAdmin: formData.get("isSuperAdmin") === "true"
  });
}

function parsePasswordUpdateFormData(formData: FormData) {
  return passwordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
}

export async function createTenantAction(
  _prevState: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  await requireSuperAdminAccess();
  const parsed = parseTenantFormData(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return buildErrorState("Please correct the highlighted tenant fields.", {
      name: flattened.name?.[0],
      slug: flattened.slug?.[0],
      defaultRegion: flattened.defaultRegion?.[0],
      criticalAlarmThreshold: flattened.criticalAlarmThreshold?.[0]
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const payload: TenantInsert = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      default_region: parsed.data.defaultRegion,
      critical_alarm_threshold: parsed.data.criticalAlarmThreshold,
      is_active: parsed.data.isActive
    };

    const { error } = await supabase.from("tenants").insert(payload as never);
    if (error) {
      return buildErrorState(error.message.includes("slug") ? "Tenant slug must be unique." : error.message);
    }
  } catch (error) {
    return buildErrorState(error instanceof Error ? error.message : "Unable to create tenant.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tenants");
  redirect("/admin/tenants?success=Tenant created");
}

export async function updateTenantAction(
  tenantId: string,
  _prevState: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  await requireSuperAdminAccess();
  const parsed = parseTenantFormData(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return buildErrorState("Please correct the highlighted tenant fields.", {
      name: flattened.name?.[0],
      slug: flattened.slug?.[0],
      defaultRegion: flattened.defaultRegion?.[0],
      criticalAlarmThreshold: flattened.criticalAlarmThreshold?.[0]
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const payload: TenantUpdate = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      default_region: parsed.data.defaultRegion,
      critical_alarm_threshold: parsed.data.criticalAlarmThreshold,
      is_active: parsed.data.isActive
    };

    const { error } = await supabase.from("tenants").update(payload as never).eq("id", tenantId);
    if (error) {
      return buildErrorState(error.message.includes("slug") ? "Tenant slug must be unique." : error.message);
    }
  } catch (error) {
    return buildErrorState(error instanceof Error ? error.message : "Unable to update tenant.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${tenantId}`);
  redirect(`/admin/tenants/${tenantId}?success=Tenant updated`);
}

export async function createAdminUserAction(
  _prevState: CreateUserFormState,
  formData: FormData
): Promise<CreateUserFormState> {
  await requireSuperAdminAccess();
  const parsed = parseCreateUserFormData(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return buildErrorState("Please correct the highlighted user fields.", {
      email: flattened.email?.[0],
      password: flattened.password?.[0],
      fullName: flattened.fullName?.[0],
      tenantId: flattened.tenantId?.[0],
      role: flattened.role?.[0]
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const tenantResult = await supabase.from("tenants").select("id, slug").eq("id", parsed.data.tenantId).maybeSingle();

    if (tenantResult.error) {
      return buildErrorState(tenantResult.error.message);
    }

    const selectedTenant = tenantResult.data as { id: string; slug: string } | null;

    if (!selectedTenant) {
      return buildErrorState("Selected tenant was not found.");
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName,
        tenant_slug: selectedTenant.slug,
        role: parsed.data.role
      }
    });

    if (error || !data.user) {
      return buildErrorState(error?.message ?? "Unable to create auth user.");
    }

    const profilePayload: ProfileUpdate = {
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      tenant_id: parsed.data.tenantId,
      role: parsed.data.role,
      is_active: parsed.data.isActive,
      is_super_admin: parsed.data.isSuperAdmin
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePayload as never)
      .eq("id", data.user.id);

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return buildErrorState(profileError.message);
    }
  } catch (error) {
    return buildErrorState(error instanceof Error ? error.message : "Unable to create user.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  redirect("/admin/users?success=User created");
}

export async function updateAdminUserAction(
  userId: string,
  _prevState: UpdateUserFormState,
  formData: FormData
): Promise<UpdateUserFormState> {
  await requireSuperAdminAccess();
  const parsed = parseUpdateUserFormData(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return buildErrorState("Please correct the highlighted user fields.", {
      email: flattened.email?.[0],
      fullName: flattened.fullName?.[0],
      tenantId: flattened.tenantId?.[0],
      role: flattened.role?.[0]
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const tenantResult = await supabase.from("tenants").select("id, slug").eq("id", parsed.data.tenantId).maybeSingle();

    if (tenantResult.error) {
      return buildErrorState(tenantResult.error.message);
    }

    const selectedTenant = tenantResult.data as { id: string; slug: string } | null;

    if (!selectedTenant) {
      return buildErrorState("Selected tenant was not found.");
    }

    const profilePayload: ProfileUpdate = {
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      tenant_id: parsed.data.tenantId,
      role: parsed.data.role,
      is_active: parsed.data.isActive,
      is_super_admin: parsed.data.isSuperAdmin
    };

    const { error: profileError } = await supabase.from("profiles").update(profilePayload as never).eq("id", userId);
    if (profileError) {
      return buildErrorState(profileError.message);
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email: parsed.data.email,
      user_metadata: {
        full_name: parsed.data.fullName,
        tenant_slug: selectedTenant.slug,
        role: parsed.data.role
      }
    });

    if (authError) {
      return buildErrorState(authError.message);
    }
  } catch (error) {
    return buildErrorState(error instanceof Error ? error.message : "Unable to update user.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?success=User updated`);
}

export async function updateAdminUserPasswordAction(
  userId: string,
  _prevState: PasswordUpdateState,
  formData: FormData
): Promise<PasswordUpdateState> {
  await requireSuperAdminAccess();
  const parsed = parsePasswordUpdateFormData(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return buildErrorState("Please correct the password fields.", {
      password: flattened.password?.[0],
      confirmPassword: flattened.confirmPassword?.[0]
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: parsed.data.password
    });

    if (error) {
      return buildErrorState(error.message);
    }
  } catch (error) {
    return buildErrorState(error instanceof Error ? error.message : "Unable to update password.");
  }

  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}/edit?success=Password updated`);
}
