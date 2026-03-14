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
          base_station_id: string | null;
          category: string;
          created_at: string;
          id: string;
          severity: "critical" | "high" | "medium" | "low";
          site_id: string;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          acknowledged?: boolean;
          base_station_id?: string | null;
          category: string;
          created_at?: string;
          id?: string;
          severity: "critical" | "high" | "medium" | "low";
          site_id: string;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alarms"]["Insert"]>;
      };
      base_stations: {
        Row: {
          backhaul_usage: number;
          code: string;
          created_at: string;
          id: string;
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
          power_level: number;
          site_id: string;
          status: "online" | "degraded" | "offline";
          tenant_id: string;
          updated_at?: string;
          vendor: string;
        };
        Update: Partial<Database["public"]["Tables"]["base_stations"]["Insert"]>;
      };
      invoices: {
        Row: {
          account_name: string;
          amount_cents: number;
          created_at: string;
          due_date: string;
          id: string;
          status: "paid" | "pending" | "overdue";
          subscription_id: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          account_name: string;
          amount_cents: number;
          created_at?: string;
          due_date: string;
          id?: string;
          status: "paid" | "pending" | "overdue";
          subscription_id?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
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
          role: string;
          tenant_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
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
          code: string;
          created_at: string;
          id: string;
          name: string;
          price_monthly_cents: number;
          site_limit: number;
          support_tier: string;
          updated_at: string;
        };
        Insert: {
          base_station_limit: number;
          code: string;
          created_at?: string;
          id?: string;
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
          created_at: string;
          id: string;
          plan_id: string;
          renews_at: string;
          seats: number;
          started_at: string;
          status: "trialing" | "active" | "past_due" | "canceled";
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          plan_id: string;
          renews_at: string;
          seats?: number;
          started_at: string;
          status: "trialing" | "active" | "past_due" | "canceled";
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
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          critical_alarm_threshold?: number;
          default_region: string;
          id?: string;
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
