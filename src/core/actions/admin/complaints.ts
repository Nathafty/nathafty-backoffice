"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { complaintRepo, type ComplaintRow } from "@/core/repositories/complaintRepo";

export async function listComplaints(): Promise<ComplaintRow[]> {
  return complaintRepo.listAll(getServiceClient());
}

export async function getComplaintDetail(id: string) {
  return complaintRepo.byId(getServiceClient(), id);
}
