"use server";

import { redirect } from "next/navigation";

import { getDefaultPathForUser } from "@/lib/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getLoginRedirect(searchParams?: URLSearchParams) {
  const error = searchParams?.get("error");
  return error ? `/login?error=${encodeURIComponent(error)}` : "/login";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    redirect(getLoginRedirect(new URLSearchParams({ error: "Email and password are required." })));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(getLoginRedirect(new URLSearchParams({ error: error.message })));
  }

  const defaultPath = data.user ? await getDefaultPathForUser(data.user.id) : "/dashboard";
  redirect(next.startsWith("/") && next ? next : defaultPath);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
