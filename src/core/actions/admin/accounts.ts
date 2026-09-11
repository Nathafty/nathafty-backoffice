"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { accountAdminService, type AdminAccountItem } from "@/core/services/admin/accountAdmin";

export async function listAdminAccounts(): Promise<AdminAccountItem[]> {
  return accountAdminService.listAdmins(getServiceClient());
}
