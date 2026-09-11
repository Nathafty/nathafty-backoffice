import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { vehicleRepo } from "@/core/repositories/vehicleRepo";
import { errors } from "@/core/http/errors";
import type { CreateVehicleDto, UpdateVehicleDto } from "@/core/dto/vehicle";

export const vehicleAdminService = {
  create(db: SupabaseClient, dto: CreateVehicleDto) {
    return vehicleRepo.insert(db, {
      license_plate: dto.license_plate,
      type: dto.type ?? null,
      assigned_driver_id: dto.assigned_driver_id ?? null,
    });
  },

  async update(db: SupabaseClient, id: number, dto: UpdateVehicleDto) {
    if (Object.keys(dto).length === 0) throw errors.badRequest("Aucun champ à mettre à jour");
    const existing = await vehicleRepo.byId(db, id);
    if (!existing) throw errors.notFound("Véhicule introuvable");
    return vehicleRepo.updateById(db, id, dto);
  },
};
