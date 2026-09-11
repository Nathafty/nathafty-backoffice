import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { districtRepo } from "@/core/repositories/districtRepo";
import { errors } from "@/core/http/errors";
import type { CreateDistrictDto, UpdateDistrictDto } from "@/core/dto/district";

export const districtAdminService = {
  create(db: SupabaseClient, dto: CreateDistrictDto) {
    return districtRepo.insert(db, {
      name: dto.name,
      code: dto.code ?? null,
      description: dto.description ?? null,
    });
  },

  async update(db: SupabaseClient, id: number, dto: UpdateDistrictDto) {
    if (Object.keys(dto).length === 0) throw errors.badRequest("Aucun champ à mettre à jour");
    const existing = await districtRepo.byId(db, id);
    if (!existing) throw errors.notFound("District introuvable");
    return districtRepo.updateById(db, id, dto);
  },
};
