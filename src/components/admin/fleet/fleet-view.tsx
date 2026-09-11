"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehiclesView } from "./vehicles-view";
import { DistrictsView } from "./districts-view";
import type { VehicleItem } from "@/core/actions/admin/fleet";
import type { DistrictRow } from "@/core/repositories/districtRepo";

export function FleetView({
  vehicles,
  districts,
  drivers,
}: {
  vehicles: VehicleItem[];
  districts: DistrictRow[];
  drivers: { id: number; name: string }[];
}) {
  return (
    <Tabs defaultValue="vehicles">
      <TabsList>
        <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
        <TabsTrigger value="districts">Districts</TabsTrigger>
      </TabsList>

      <TabsContent value="vehicles" className="mt-4">
        <VehiclesView vehicles={vehicles} drivers={drivers} />
      </TabsContent>

      <TabsContent value="districts" className="mt-4">
        <DistrictsView districts={districts} />
      </TabsContent>
    </Tabs>
  );
}
