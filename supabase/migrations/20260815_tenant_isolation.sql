create or replace function public.current_user_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.clinic_id
  from public.profiles p
  where p.id = auth.uid()
     or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  order by (p.id = auth.uid()) desc
  limit 1;
$$;

revoke all on function public.current_user_clinic_id() from public;
grant execute on function public.current_user_clinic_id() to anon, authenticated;

-- Existing business rows are currently empty; refuse to create a partial migration
-- if a future deployment contains unassigned rows.
do $$
declare
  t text;
  n bigint;
begin
  foreach t in array array['patients','doctors','appointments','dental_xrays','pharmacy_items','invoices','prescriptions'] loop
    execute format('select count(*) from public.%I where clinic_id is null', t) into n;
    if n > 0 then
      raise exception 'Cannot enforce clinic ownership: %.% has % rows without clinic_id', 'public', t, n;
    end if;
  end loop;
end $$;

alter table public.patients alter column clinic_id set not null;
alter table public.doctors alter column clinic_id set not null;
alter table public.appointments alter column clinic_id set not null;
alter table public.dental_xrays alter column clinic_id set not null;
alter table public.pharmacy_items alter column clinic_id set not null;
alter table public.invoices alter column clinic_id set not null;
alter table public.prescriptions alter column clinic_id set not null;

create index if not exists idx_patients_clinic_id on public.patients(clinic_id);
create index if not exists idx_doctors_clinic_id on public.doctors(clinic_id);
create index if not exists idx_appointments_clinic_id on public.appointments(clinic_id);
create index if not exists idx_dental_xrays_clinic_id on public.dental_xrays(clinic_id);
create index if not exists idx_pharmacy_items_clinic_id on public.pharmacy_items(clinic_id);
create index if not exists idx_invoices_clinic_id on public.invoices(clinic_id);
create index if not exists idx_prescriptions_clinic_id on public.prescriptions(clinic_id);

-- Remove every prior public/permissive policy on tenant tables.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('clinic_info','profiles','patients','doctors','appointments','dental_xrays','pharmacy_items','invoices','prescriptions')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

alter table public.clinic_info enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.dental_xrays enable row level security;
alter table public.pharmacy_items enable row level security;
alter table public.invoices enable row level security;
alter table public.prescriptions enable row level security;

create policy clinic_info_select_own on public.clinic_info
  for select to authenticated
  using (id = public.current_user_clinic_id());

create policy clinic_info_update_own on public.clinic_info
  for update to authenticated
  using (id = public.current_user_clinic_id())
  with check (id = public.current_user_clinic_id());

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

do $$
declare
  t text;
begin
  foreach t in array array['patients','doctors','appointments','dental_xrays','pharmacy_items','invoices','prescriptions'] loop
    execute format('create policy %I on public.%I for select to authenticated using (clinic_id = public.current_user_clinic_id())', t || '_select_own_clinic', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (clinic_id = public.current_user_clinic_id())', t || '_insert_own_clinic', t);
    execute format('create policy %I on public.%I for update to authenticated using (clinic_id = public.current_user_clinic_id()) with check (clinic_id = public.current_user_clinic_id())', t || '_update_own_clinic', t);
    execute format('create policy %I on public.%I for delete to authenticated using (clinic_id = public.current_user_clinic_id())', t || '_delete_own_clinic', t);
  end loop;
end $$;
