import { NextRequest, NextResponse } from "next/server";

import { getDefaultPathForUser } from "@/lib/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") ?? "";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!next && user) {
      next = await getDefaultPathForUser(user.id);
    }
  }

  return NextResponse.redirect(new URL(next || "/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
