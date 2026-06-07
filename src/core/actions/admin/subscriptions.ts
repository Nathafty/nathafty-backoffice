"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { renewalRepo } from "@/core/repositories/renewalRepo";
import { subscriptionRepo } from "@/core/repositories/subscriptionRepo";
import { subscriptionPlanRepo, type PlanRow } from "@/core/repositories/subscriptionPlanRepo";

export interface RenewalListItem {
  id: number;
  household_id: string;
  household_name: string | null;
  plan_name: string | null;
  price_mru: number | null;
  status: string;
  requested_at: string | null;
}

export async function listRenewalRequests(status?: string): Promise<RenewalListItem[]> {
  const rows = await renewalRepo.listAll(getServiceClient(), status);
  return rows.map((r) => {
    const x = r as unknown as {
      id: number;
      household_id: string;
      status: string;
      requested_at: string | null;
      households: { name: string } | null;
      subscription_plans: { name: string; price_mru: number } | null;
    };
    return {
      id: x.id,
      household_id: x.household_id,
      household_name: x.households?.name ?? null,
      plan_name: x.subscription_plans?.name ?? null,
      price_mru: x.subscription_plans?.price_mru ?? null,
      status: x.status,
      requested_at: x.requested_at,
    };
  });
}

export interface SubscriptionListItem {
  id: number;
  household_name: string | null;
  plan_name: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

export async function listSubscriptions(): Promise<SubscriptionListItem[]> {
  const rows = await subscriptionRepo.listAll(getServiceClient());
  return rows.map((r) => {
    const x = r as unknown as {
      id: number;
      start_date: string;
      end_date: string;
      status: string;
      households: { name: string } | null;
      subscription_plans: { name: string } | null;
    };
    return {
      id: x.id,
      household_name: x.households?.name ?? null,
      plan_name: x.subscription_plans?.name ?? null,
      start_date: x.start_date,
      end_date: x.end_date,
      status: x.status,
    };
  });
}

export async function listPlans(): Promise<PlanRow[]> {
  return subscriptionPlanRepo.listAll(getServiceClient());
}
