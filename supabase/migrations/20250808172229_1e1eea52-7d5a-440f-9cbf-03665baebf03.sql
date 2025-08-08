
-- 1) Fix RLS policies for helper_applications (drop broken ones and recreate correct ones)

drop policy if exists "Helpers can create applications" on public.helper_applications;
drop policy if exists "Helpers can view their applications" on public.helper_applications;
drop policy if exists "Planners can update application status" on public.helper_applications;
drop policy if exists "Planners can view applications for their requests" on public.helper_applications;

alter table public.helper_applications enable row level security;

-- Helpers can create their own applications by proving helper_id belongs to them
create policy "Helpers can create applications"
  on public.helper_applications
  for insert
  to authenticated
  with check (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
  );

-- Helpers can view their own applications
create policy "Helpers can view their applications"
  on public.helper_applications
  for select
  to authenticated
  using (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
  );

-- (Optional but helpful) Helpers can update their own pending applications
create policy "Helpers can update their pending applications"
  on public.helper_applications
  for update
  to authenticated
  using (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
    and status = 'pending'
  );

-- Planners can view applications to their own helper_requests
create policy "Planners can view applications for their requests"
  on public.helper_applications
  for select
  to authenticated
  using (
    auth.uid() = (
      select p.user_id
      from public.planners p
      join public.helper_requests hr on hr.planner_id = p.id
      where hr.id = helper_applications.helper_request_id
    )
  );

-- Planners can update application status for applications to their requests
create policy "Planners can update application status"
  on public.helper_applications
  for update
  to authenticated
  using (
    auth.uid() = (
      select p.user_id
      from public.planners p
      join public.helper_requests hr on hr.planner_id = p.id
      where hr.id = helper_applications.helper_request_id
    )
  );



-- 2) Make helper_requests visible to helpers (based on profile role) and to the owning planner

drop policy if exists "Only helpers can view helper requests" on public.helper_requests;

create policy "Helpers and owner can view helper requests"
  on public.helper_requests
  for select
  to authenticated
  using (
    -- Any user whose profile role is 'helper'
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.user_role = 'helper'
    )
    -- OR the planner who owns the request
    or auth.uid() = (
      select p.user_id from public.planners p
      where p.id = helper_requests.planner_id
    )
  );



-- 3) Auto-provision a helpers row whenever a profile is created/updated with role = 'helper'

create or replace function public.ensure_helper_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_role = 'helper' then
    insert into public.helpers (user_id)
    select new.user_id
    where not exists (
      select 1 from public.helpers h where h.user_id = new.user_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_after_insert_helper on public.profiles;
create trigger trg_profiles_after_insert_helper
after insert on public.profiles
for each row
execute function public.ensure_helper_profile();

drop trigger if exists trg_profiles_after_update_helper on public.profiles;
create trigger trg_profiles_after_update_helper
after update of user_role on public.profiles
for each row
when (new.user_role = 'helper' and (old.user_role is distinct from 'helper'))
execute function public.ensure_helper_profile();



-- 4) One-time backfill: create helpers rows for any existing helper profiles that are missing one

insert into public.helpers (user_id)
select p.user_id
from public.profiles p
left join public.helpers h on h.user_id = p.user_id
where p.user_role = 'helper'
  and h.user_id is null;



-- 5) Improve location filtering performance on helper_requests

create index if not exists idx_helper_requests_location_city
  on public.helper_requests (location_city);
