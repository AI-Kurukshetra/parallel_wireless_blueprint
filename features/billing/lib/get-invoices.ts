import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { Invoice } from "@/types/domain";
import type { Database } from "@/types/database";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("due_date", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as InvoiceRow[];

  return rows.map((invoice) => ({
    id: invoice.id,
    accountName: invoice.account_name,
    amount: invoice.amount_cents / 100,
    dueDate: invoice.due_date,
    status: invoice.status
  }));
}
