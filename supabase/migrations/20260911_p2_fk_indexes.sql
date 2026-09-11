-- Perf (P2, voir PERFORMANCE_AUDIT.md) — index manquants sur des FK secondaires,
-- signalées par l'advisor Supabase (unindexed_foreign_keys) après le lot P0.
-- Impact plus modeste que le lot P0 (jointures admin à trafic faible), mais gratuit à ajouter.
create index if not exists idx_expenses_driver on public.expenses (driver_id);
create index if not exists idx_expenses_vehicle on public.expenses (vehicle_id);
create index if not exists idx_subscriptions_plan on public.subscriptions (plan_id);
create index if not exists idx_subscriptions_payment on public.subscriptions (payment_id);
