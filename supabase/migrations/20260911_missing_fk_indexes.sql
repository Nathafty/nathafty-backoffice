-- Perf (P0, voir PERFORMANCE_AUDIT.md) — index manquants sur des FK très sollicitées.
-- houses_to_collect n'avait aucun index en dehors de sa PK : household_id est filtré à
-- chaque chargement de /compte et /compte/collectes côté PWA, collection_id à chaque
-- détail de collecte côté admin. collections.driver_id est utilisé par la fiche collecteur
-- admin et les jointures collections↔drivers.
create index if not exists idx_houses_to_collect_household on public.houses_to_collect (household_id);
create index if not exists idx_houses_to_collect_collection on public.houses_to_collect (collection_id);
create index if not exists idx_collections_driver on public.collections (driver_id);
