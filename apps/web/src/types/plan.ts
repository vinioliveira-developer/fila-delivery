export type PlanFeature = {
  id: string;
  planId: string;
  featureId: string;
  featureKey: string;
  name: string;
  description?: string;
  enabled: boolean;
  limitValue?: number | null;
};

export type Plan = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceCents: number;
  billingCycle: "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL";
  userLimit?: number | null;
  historyDays: number;
  restaurantLimit: number;
  status: string;
  sortOrder: number;
  features: PlanFeature[];
};
