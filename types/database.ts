export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      alarms: {
        Row: {
          acknowledged: boolean;
          acknowledged_at: string | null;
          acknowledged_by_profile_id: string | null;
          assigned_at: string | null;
          assigned_by_profile_id: string | null;
          assignee_profile_id: string | null;
          base_station_id: string | null;
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          message: string | null;
          resolved_at: string | null;
          severity: "critical" | "high" | "medium" | "low";
          site_id: string;
          source_vendor: string | null;
          status: "open" | "acknowledged" | "in_progress" | "resolved" | "closed";
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          acknowledged?: boolean;
          acknowledged_at?: string | null;
          acknowledged_by_profile_id?: string | null;
          assigned_at?: string | null;
          assigned_by_profile_id?: string | null;
          assignee_profile_id?: string | null;
          base_station_id?: string | null;
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          message?: string | null;
          resolved_at?: string | null;
          severity: "critical" | "high" | "medium" | "low";
          site_id: string;
          source_vendor?: string | null;
          status?: "open" | "acknowledged" | "in_progress" | "resolved" | "closed";
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alarms"]["Insert"]>;
      };
      alarm_events: {
        Row: {
          actor_profile_id: string | null;
          alarm_id: string;
          created_at: string;
          event_type: string;
          id: string;
          message: string;
          metadata: Json;
          tenant_id: string;
        };
        Insert: {
          actor_profile_id?: string | null;
          alarm_id: string;
          created_at?: string;
          event_type: string;
          id?: string;
          message: string;
          metadata?: Json;
          tenant_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["alarm_events"]["Insert"]>;
      };
      alarm_notes: {
        Row: {
          alarm_id: string;
          author_profile_id: string | null;
          body: string;
          created_at: string;
          id: string;
          tenant_id: string;
        };
        Insert: {
          alarm_id: string;
          author_profile_id?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          tenant_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["alarm_notes"]["Insert"]>;
      };
      base_stations: {
        Row: {
          backhaul_usage: number;
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          power_level: number;
          site_id: string;
          status: "online" | "degraded" | "offline";
          tenant_id: string;
          updated_at: string;
          vendor: string;
        };
        Insert: {
          backhaul_usage: number;
          code: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          power_level: number;
          site_id: string;
          status: "online" | "degraded" | "offline";
          tenant_id: string;
          updated_at?: string;
          vendor: string;
        };
        Update: Partial<Database["public"]["Tables"]["base_stations"]["Insert"]>;
      };
      billing_cycles: {
        Row: {
          created_at: string;
          cycle_end: string;
          cycle_start: string;
          due_date: string;
          id: string;
          invoice_date: string;
          status: "scheduled" | "invoiced" | "paid" | "overdue" | "closed";
          subscription_id: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          cycle_end: string;
          cycle_start: string;
          due_date: string;
          id?: string;
          invoice_date: string;
          status?: "scheduled" | "invoiced" | "paid" | "overdue" | "closed";
          subscription_id: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_cycles"]["Insert"]>;
      };
      invoices: {
        Row: {
          account_name: string;
          amount_cents: number;
          billing_cycle_id: string | null;
          created_at: string;
          currency: string;
          due_date: string;
          id: string;
          invoice_number: string | null;
          issue_date: string | null;
          paid_at: string | null;
          paid_by_profile_id: string | null;
          status: "draft" | "issued" | "paid" | "overdue" | "void";
          status_updated_at: string | null;
          status_updated_by_profile_id: string | null;
          subtotal_cents: number;
          subscription_id: string | null;
          tenant_id: string;
          total_cents: number;
          updated_at: string;
        };
        Insert: {
          account_name: string;
          amount_cents: number;
          billing_cycle_id?: string | null;
          created_at?: string;
          currency?: string;
          due_date: string;
          id?: string;
          invoice_number?: string | null;
          issue_date?: string | null;
          paid_at?: string | null;
          paid_by_profile_id?: string | null;
          status: "draft" | "issued" | "paid" | "overdue" | "void";
          status_updated_at?: string | null;
          status_updated_by_profile_id?: string | null;
          subtotal_cents?: number;
          subscription_id?: string | null;
          tenant_id: string;
          total_cents?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      invoice_line_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          invoice_id: string;
          quantity: number;
          tenant_id: string;
          total_amount_cents: number;
          unit_amount_cents: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          invoice_id: string;
          quantity?: number;
          tenant_id: string;
          total_amount_cents?: number;
          unit_amount_cents?: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_line_items"]["Insert"]>;
      };
      network_snapshots: {
        Row: {
          coverage: number;
          created_at: string;
          energy_cost_cents: number;
          id: string;
          label: string;
          snapshot_date: string;
          tenant_id: string;
          updated_at: string;
          utilization: number;
        };
        Insert: {
          coverage: number;
          created_at?: string;
          energy_cost_cents: number;
          id?: string;
          label: string;
          snapshot_date: string;
          tenant_id: string;
          updated_at?: string;
          utilization: number;
        };
        Update: Partial<Database["public"]["Tables"]["network_snapshots"]["Insert"]>;
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          is_super_admin: boolean;
          role: string;
          tenant_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          is_super_admin?: boolean;
          role?: string;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      sites: {
        Row: {
          code: string;
          coverage_percent: number;
          created_at: string;
          id: string;
          is_active: boolean;
          monthly_energy_cost_cents: number;
          name: string;
          region: string;
          status: "online" | "degraded" | "offline";
          subscribers: number;
          technology: string;
          tenant_id: string;
          updated_at: string;
          uptime: number;
        };
        Insert: {
          code: string;
          coverage_percent?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          monthly_energy_cost_cents?: number;
          name: string;
          region: string;
          status: "online" | "degraded" | "offline";
          subscribers: number;
          technology: string;
          tenant_id: string;
          updated_at?: string;
          uptime: number;
        };
        Update: Partial<Database["public"]["Tables"]["sites"]["Insert"]>;
      };
      subscription_plans: {
        Row: {
          base_station_limit: number;
          billing_interval: "monthly" | "quarterly" | "annual";
          code: string;
          created_at: string;
          currency: string;
          feature_summary: Json;
          id: string;
          is_active: boolean;
          name: string;
          price_monthly_cents: number;
          site_limit: number;
          support_tier: string;
          updated_at: string;
        };
        Insert: {
          base_station_limit: number;
          billing_interval?: "monthly" | "quarterly" | "annual";
          code: string;
          created_at?: string;
          currency?: string;
          feature_summary?: Json;
          id?: string;
          is_active?: boolean;
          name: string;
          price_monthly_cents: number;
          site_limit: number;
          support_tier: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscription_plans"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          canceled_at: string | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          grace_ends_at: string | null;
          id: string;
          plan_id: string;
          renews_at: string;
          seats: number;
          started_at: string;
          status: "trialing" | "active" | "past_due" | "canceled";
          suspended_at: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          canceled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          grace_ends_at?: string | null;
          id?: string;
          plan_id: string;
          renews_at: string;
          seats?: number;
          started_at: string;
          status: "trialing" | "active" | "past_due" | "canceled";
          suspended_at?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      tenants: {
        Row: {
          created_at: string;
          critical_alarm_threshold: number;
          default_region: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          critical_alarm_threshold?: number;
          default_region: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
