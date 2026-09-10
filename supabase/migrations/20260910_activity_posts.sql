-- Publications publiques d'activités (ex: nettoyage hebdomadaire d'un dépôt sauvage).
-- Lecture publique des posts publiés uniquement ; écriture réservée à la clé service-role
-- (pas d'UI admin de gestion dans ce lot).
create table public.activity_posts (
  id              bigint generated always as identity primary key,
  title           text not null,
  description     text,
  cover_image_url text,
  zone            text,
  event_date      date,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.activity_posts enable row level security;

create policy "public reads published activity posts"
  on public.activity_posts for select
  to anon, authenticated
  using (is_published = true);
