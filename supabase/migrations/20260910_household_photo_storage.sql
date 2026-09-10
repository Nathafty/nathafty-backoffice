-- PWA client — photo optionnelle de la devanture du ménage.
-- Bucket privé (pas d'accès public) : lecture/écriture réservées au ménage
-- propriétaire, lecture supplémentaire pour admin/driver (identification terrain).
alter table public.households
  add column photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('household-photos', 'household-photos', false, 5242880, array['image/jpeg','image/png','image/webp']);

-- IMPORTANT : qualifier `storage.objects.name` explicitement (jamais `name` seul) —
-- `households` a elle-même une colonne `name`, qui shadow silencieusement la
-- référence voulue dans cette sous-requête corrélée sinon.
create policy "household manages own photo"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'household-photos'
  and exists (
    select 1 from public.households h
    where h.id = (storage.foldername(storage.objects.name))[1] and h.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'household-photos'
  and exists (
    select 1 from public.households h
    where h.id = (storage.foldername(storage.objects.name))[1] and h.user_id = auth.uid()
  )
);

create policy "admin driver read household photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'household-photos'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin','super_admin','driver')
  )
);
