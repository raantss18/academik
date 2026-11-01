-- academik : schéma DÉDIÉ dans le Supabase partagé (Tontolo, Mahay). Ne touche à aucun autre schéma.
-- À appliquer par Antsa seulement. Après application : Settings → API → « Exposed schemas » → ajouter `academik`.
create schema if not exists academik;

-- Journal des réponses : en ajout seul. Les colonnes _modified / _deleted sont exigées par la réplication RxDB.
create table academik.events (
  id         uuid primary key,                                   -- fourni par le client : envoi idempotent
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  level      text not null check (level ~ '^[0-9]+\.([0-9]+|boss)$'),
  item       text not null check (char_length(item) between 1 and 64),
  credit     real not null check (credit between 0 and 1),
  hints      int  not null default 0 check (hints between 0 and 20),
  xp         int  not null default 0 check (xp between 0 and 100),
  dev        text not null default '' check (char_length(dev) <= 32),
  t          timestamptz not null,
  _modified  timestamptz not null default now(),
  _deleted   boolean not null default false
);
create index events_user_modified on academik.events (user_id, _modified);

-- Profil minimal (aucune donnée personnelle obligatoire).
create table academik.profiles (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  lang       text not null default 'fr' check (lang in ('fr', 'en')),
  retention  real not null default 0.9 check (retention between 0.7 and 0.97),
  _modified  timestamptz not null default now(),
  _deleted   boolean not null default false
);

alter table academik.events   enable row level security;
alter table academik.profiles enable row level security;

create policy events_select on academik.events for select to authenticated using (user_id = auth.uid());
create policy events_insert on academik.events for insert to authenticated with check (user_id = auth.uid());
-- Pas de policy update/delete sur events : personne ne réécrit l'histoire (effacement RGPD : erase_my_data()).

create policy profiles_all on academik.profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Droit à l'effacement (RGPD) : supprime les données de l'utilisateur connecté.
create function academik.erase_my_data() returns void
language sql security definer set search_path = '' as $$
  delete from academik.events   where user_id = auth.uid();
  delete from academik.profiles where user_id = auth.uid();
$$;
revoke all on function academik.erase_my_data() from public, anon;
grant execute on function academik.erase_my_data() to authenticated;

revoke all on schema academik from public, anon;
grant usage on schema academik to authenticated;
grant select, insert on academik.events to authenticated;
grant select, insert, update, delete on academik.profiles to authenticated;

alter publication supabase_realtime add table academik.events, academik.profiles;
