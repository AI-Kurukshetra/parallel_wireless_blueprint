export type Severity = "critical" | "high" | "medium" | "low";
export type SiteStatus = "online" | "degraded" | "offline";
export type AlarmStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "closed";
export type BillingInterval = "monthly" | "quarterly" | "annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";
export type BillingCycleStatus = "scheduled" | "invoiced" | "paid" | "overdue" | "closed";
export type InvoiceWorkflowStatus = "draft" | "issued" | "paid" | "overdue" | "void";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
};

export type Site = {
  id: string;
  code: string;
  name: string;
  region: string;
  uptime: number;
  subscribers: number;
  status: SiteStatus;
  technology: string;
  coveragePercent: number;
  monthlyEnergyCost: number;
  isActive: boolean;
};

export type BaseStation = {
  id: string;
  code: string;
  siteId: string;
  siteName: string;
  siteCode: string;
  vendor: string;
  powerLevel: number;
  backhaulUsage: number;
  status: SiteStatus;
  isActive: boolean;
};

export type Alarm = {
  id: string;
  title: string;
  siteName: string;
  siteId: string;
  baseStationId: string | null;
  baseStationCode: string | null;
  severity: Severity;
  status: AlarmStatus;
  category: string;
  sourceVendor: string | null;
  description: string | null;
  message: string | null;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  assigneeProfileId: string | null;
  assigneeName: string | null;
  assignedAt: string | null;
};

export type AlarmNote = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string | null;
};

export type AlarmEvent = {
  id: string;
  eventType: string;
  message: string;
  createdAt: string;
  actorName: string | null;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  accountName: string;
  subtotal: number;
  total: number;
  currency: string;
  issueDate: string | null;
  dueDate: string;
  status: InvoiceWorkflowStatus;
  billingCycleId: string | null;
  paidAt: string | null;
  subscriptionId: string | null;
};

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  billingInterval: BillingInterval;
  basePrice: number;
  currency: string;
  siteLimit: number;
  baseStationLimit: number;
  supportTier: string;
  isActive: boolean;
  featureSummary: Record<string, string>;
};

export type SubscriptionSummary = {
  id: string;
  status: SubscriptionStatus;
  seats: number;
  startedAt: string;
  renewsAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  suspendedAt: string | null;
  canceledAt: string | null;
  plan: SubscriptionPlan;
};

export type BillingCycle = {
  id: string;
  cycleStart: string;
  cycleEnd: string;
  invoiceDate: string;
  dueDate: string;
  status: BillingCycleStatus;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
};

export type AnalyticsSnapshot = {
  id: string;
  label: string;
  coverage: number;
  utilization: number;
  energyCost: number;
};

export type SettingItem = {
  id: string;
  label: string;
  description: string;
  value: string;
};
