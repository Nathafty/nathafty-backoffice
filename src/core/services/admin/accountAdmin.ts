import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { userRoleRepo } from "@/core/repositories/userRoleRepo";
import { errors } from "@/core/http/errors";
import type { CreateAdminAccountDto } from "@/core/dto/account";

export interface AdminAccountItem {
  user_id: string;
  email: string | null;
  role: string;
  created_at: string | null;
}

export const accountAdminService = {
  /** Comptes admin/gérant : rôle en base (user_roles) croisé avec l'email (API Auth admin). */
  async listAdmins(db: SupabaseClient): Promise<AdminAccountItem[]> {
    const roles = await userRoleRepo.listByRoles(db, ["admin", "super_admin"]);
    if (roles.length === 0) return [];
    const { data: usersData, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    const emailByUserId = new Map(usersData.users.map((u) => [u.id, u.email ?? null]));
    return roles.map((r) => ({
      user_id: r.user_id,
      email: emailByUserId.get(r.user_id) ?? null,
      role: r.role,
      created_at: r.created_at,
    }));
  },

  /** Crée un compte admin/gérant : compte Auth (email confirmé) + rôle. Pas de table de profil dédiée. */
  async createAdminAccount(db: SupabaseClient, dto: CreateAdminAccountDto) {
    const { data: created, error: authErr } = await db.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });
    if (authErr || !created.user) {
      const msg = authErr?.message ?? "";
      if (/already|registered|exist/i.test(msg)) {
        throw errors.conflict("Cet email est déjà utilisé", "EMAIL_ALREADY_USED");
      }
      throw errors.internal(msg || "Création du compte échouée");
    }
    const userId = created.user.id;

    try {
      await userRoleRepo.setRole(db, userId, dto.role);
      return { user_id: userId, email: dto.email, role: dto.role };
    } catch (err) {
      await db.auth.admin.deleteUser(userId).catch(() => {});
      throw err;
    }
  },
};
