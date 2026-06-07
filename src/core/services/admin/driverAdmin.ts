import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { driverRepo } from "@/core/repositories/driverRepo";
import { userRoleRepo } from "@/core/repositories/userRoleRepo";
import { errors } from "@/core/http/errors";
import type { CreateDriverDto, UpdateDriverDto } from "@/core/dto/driverAdmin";

export const driverAdminService = {
  /** Crée un collecteur : compte Supabase Auth (email confirmé) + ligne drivers + rôle 'driver'. */
  async createWithAccount(db: SupabaseClient, dto: CreateDriverDto) {
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
      const driver = await driverRepo.insert(db, {
        name: dto.name,
        phone: dto.phone ?? null,
        nni: dto.nni ?? null,
        user_id: userId,
      });
      await userRoleRepo.setRole(db, userId, "driver");
      return driver;
    } catch (err) {
      await db.auth.admin.deleteUser(userId).catch(() => {});
      throw err;
    }
  },

  async update(db: SupabaseClient, id: number, dto: UpdateDriverDto) {
    const existing = await driverRepo.byId(db, id);
    if (!existing) throw errors.notFound("Collecteur introuvable");
    return driverRepo.updateById(db, id, dto);
  },

  async setStatus(db: SupabaseClient, id: number, status: string) {
    const existing = await driverRepo.byId(db, id);
    if (!existing) throw errors.notFound("Collecteur introuvable");
    return driverRepo.updateById(db, id, { status });
  },
};
