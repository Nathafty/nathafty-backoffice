-- Module Dépenses (admin) — table des dépenses de l'entreprise.
create table if not exists public.expenses (
  id             bigint generated always as identity primary key,
  category       text not null check (category in ('carburant','salaire','maintenance','autre')),
  amount_mru     numeric(12,2) not null check (amount_mru >= 0),
  expense_date   date not null default current_date,
  description    text,
  vehicle_id     integer references public.vehicles(id) on delete set null,
  driver_id      integer references public.drivers(id) on delete set null,
  payment_method text,
  created_by     uuid,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists idx_expenses_date on public.expenses (expense_date desc);
create index if not exists idx_expenses_category on public.expenses (category);
