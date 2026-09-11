-- Perf (P3, voir PERFORMANCE_AUDIT.md) — agrégation côté SQL pour le dashboard admin,
-- au lieu de rapatrier toutes les lignes (collections / expenses) et sommer en JS.
-- SECURITY INVOKER + search_path fixé : pas de contournement RLS, cohérent avec la
-- remarque déjà notée sur update_updated_at_column (search_path mutable à éviter).

create or replace function public.admin_collections_weekly_counts(p_start date, p_end date)
returns table (week_start date, collections_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select date_trunc('week', scheduled_date)::date as week_start,
         count(*) as collections_count
  from public.collections
  where scheduled_date >= p_start
    and scheduled_date <= p_end
  group by 1
  order by 1;
$$;

create or replace function public.admin_expenses_by_category(p_start date)
returns table (category text, total_amount numeric)
language sql
stable
security invoker
set search_path = public
as $$
  select category, sum(amount_mru) as total_amount
  from public.expenses
  where expense_date >= p_start
  group by category
  order by 2 desc;
$$;
