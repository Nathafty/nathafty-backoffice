-- PWA client — distinction "maison" / "établissement" à l'inscription.
create type household_type as enum ('MAISON', 'ETABLISSEMENT');

alter table public.households
  add column type household_type not null default 'MAISON';
