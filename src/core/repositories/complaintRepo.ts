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

const ADMIN_COLUMNS =
  "id, ticket_number, household_id, household_name, category, priority, status, " +
  "description, response, submitted_date, resolved_date, created_at";

export interface ComplaintRow {
  id: string;
  ticket_number: string;
  household_id: string | null;
  household_name: string | null;
  category: string;
  priority: string | null;
  status: string | null;
  description: string | null;
  response: string | null;
  submitted_date: string | null;
  resolved_date: string | null;
  created_at: string | null;
}

export interface ComplaintDetail extends ComplaintRow {
  households: { phone: string | null } | null;
  complaint_attachments: { id: number; file_url: string; file_type: string | null }[];
}

export const complaintRepo = {
  /** Liste admin (toutes réclamations, tous ménages). */
  async listAll(db: SupabaseClient): Promise<ComplaintRow[]> {
    const { data, error } = await db
      .from("complaints")
      .select(ADMIN_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as ComplaintRow[];
  },

  async byId(db: SupabaseClient, id: string): Promise<ComplaintDetail | null> {
    const { data, error } = await db
      .from("complaints")
      .select(`${ADMIN_COLUMNS}, households(phone), complaint_attachments(id, file_url, file_type)`)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as ComplaintDetail | null) ?? null;
  },

  async updateById(
    db: SupabaseClient,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<ComplaintRow | null> {
    const { data, error } = await db
      .from("complaints")
      .update(patch)
      .eq("id", id)
      .select(ADMIN_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as ComplaintRow | null) ?? null;
  },

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
