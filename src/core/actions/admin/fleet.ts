"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { vehicleRepo } from "@/core/repositories/vehicleRepo";
import { districtRepo } from "@/core/repositories/districtRepo";
import { driverRepo } from "@/core/repositories/driverRepo";

export interface VehicleItem {
  id: number;
  license_plate: string;
  type: string | null;
  is_active: boolean;
  assigned_driver_id: number | null;
  driver_name: string | null;
}

export async function listVehicles(): Promise<VehicleItem[]> {
  const rows = await vehicleRepo.listAll(getServiceClient());
  return (rows as unknown as {
    id: number;
    license_plate: string;
    type: string | null;
    is_active: boolean;
    assigned_driver_id: number | null;
    drivers: { name: string } | null;
  }[]).map((r) => ({
    id: r.id,
    license_plate: r.license_plate,
    type: r.type,
    is_active: r.is_active,
    assigned_driver_id: r.assigned_driver_id,
    driver_name: r.drivers?.name ?? null,
  }));
}

export async function listDistricts() {
  return districtRepo.listAll(getServiceClient());
}

export async function listDriversLite() {
  return driverRepo.listLite(getServiceClient());
}
