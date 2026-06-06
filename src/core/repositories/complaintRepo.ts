import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface NewComplaint {
  id: string;
  ticket_number: string;
  household_id: string;
  household_name: string | null;
  category: string;
  description: string;
}

export const complaintRepo = {
  async listByHousehold(db: SupabaseClient, householdId: string) {
    const { data, error } = await db
      .from("complaints")
      .select(
        "id, ticket_number, category, priority, status, description, response, " +
          "submitted_date, resolved_date, created_at",
      )
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Nombre de réclamations dont le ticket appartient à l'année donnée (pour la séquence). */
  async countForYear(db: SupabaseClient, year: number): Promise<number> {
    const { count, error } = await db
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .like("ticket_number", `CMP-${year}-%`);
    if (error) throw error;
    return count ?? 0;
  },

  async insert(db: SupabaseClient, c: NewComplaint) {
    const { data, error } = await db
      .from("complaints")
      .insert(c)
      .select(
        "id, ticket_number, category, priority, status, description, submitted_date, created_at",
      )
      .single();
    if (error) throw error;
    return data;
  },

  async insertAttachment(
    db: SupabaseClient,
    complaintId: string,
    fileUrl: string,
  ): Promise<void> {
    const { error } = await db
      .from("complaint_attachments")
      .insert({ complaint_id: complaintId, file_url: fileUrl });
    if (error) throw error;
  },
};
