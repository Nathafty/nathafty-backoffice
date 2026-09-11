-- Vehicles : désactivation + affectation à un collecteur (module Véhicules & Districts)
alter table public.vehicles add column if not exists is_active boolean not null default true;
alter table public.vehicles add column if not exists assigned_driver_id int4 references public.drivers(id);

-- Index FK manquants (advisor unindexed_foreign_keys, reliquat après les lots P0/P2)
create index if not exists idx_vehicles_assigned_driver on public.vehicles (assigned_driver_id);
create index if not exists idx_households_district on public.households (district_id);
create index if not exists idx_complaints_driver on public.complaints (driver_id);
create index if not exists idx_houses_to_collect_completed_by_driver on public.houses_to_collect (completed_by_driver_id);
create index if not exists idx_renewal_requests_processed_by on public.renewal_requests (processed_by_user_id);
create index if not exists idx_renewal_requests_plan on public.renewal_requests (requested_plan_id);
