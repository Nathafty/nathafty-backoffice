import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAnonClient } from "@/lib/supabase/anon";
import { householdRepo } from "@/core/repositories/householdRepo";
import { userRoleRepo } from "@/core/repositories/userRoleRepo";
import { errors } from "@/core/http/errors";
import {
  deriveEmail,
  normalizeMrPhone,
  type LoginCustomerDto,
  type RegisterCustomerDto,
} from "@/core/dto/auth";

export const authService = {
  /**
   * Self-signup customer : crée le compte Supabase Auth (email dérivé du téléphone,
   * auto-confirmé), le ménage (status PENDING) et le rôle 'customer'.
   * `db` doit être le client service-role (accès auth.admin).
   */
  async registerCustomer(db: SupabaseClient, dto: RegisterCustomerDto) {
    const phone8 = normalizeMrPhone(dto.phone);
    const email = deriveEmail(phone8);

    if (await householdRepo.existsByPhone(db, phone8)) {
      throw errors.conflict("Ce numéro est déjà enregistré", "PHONE_ALREADY_USED");
    }

    const { data: created, error: authErr } = await db.auth.admin.createUser({
      email,
      password: dto.password,
      email_confirm: true,
    });
    if (authErr || !created.user) {
      const msg = authErr?.message ?? "";
      if (/already|registered|exist/i.test(msg)) {
        throw errors.conflict("Ce numéro est déjà enregistré", "PHONE_ALREADY_USED");
      }
      throw errors.internal(msg || "Création du compte échouée");
    }
    const userId = created.user.id;

    try {
      const household = await householdRepo.create(db, {
        name: dto.name,
        phone: phone8,
        user_id: userId,
        address: dto.address,
        whatsapp: dto.whatsapp,
        district_id: dto.district_id,
        family_size: dto.family_size,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
      await userRoleRepo.setRole(db, userId, "customer");
      return { household, email };
    } catch (err) {
      // Rollback best-effort : éviter un compte auth orphelin.
      await db.auth.admin.deleteUser(userId).catch(() => {});
      throw err;
    }
  },

  /**
   * Login customer : username = téléphone, dérive l'email et authentifie via Supabase.
   * Renvoie la session (tokens) pour l'app Flutter.
   */
  async loginCustomer(dto: LoginCustomerDto) {
    const email = deriveEmail(normalizeMrPhone(dto.phone));
    const anon = createAnonClient();
    const { data, error } = await anon.auth.signInWithPassword({
      email,
      password: dto.password,
    });
    if (error || !data.session) {
      throw errors.unauthorized("Identifiants invalides", "INVALID_CREDENTIALS");
    }
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: { id: data.user.id },
    };
  },
};
