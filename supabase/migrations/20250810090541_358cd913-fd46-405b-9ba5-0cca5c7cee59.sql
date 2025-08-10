-- Create helper_tasks table for personal tasks managed by helpers
create table if not exists public.helper_tasks (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null,
  title text not null,
  description text,
  priority text not null default 'medium',
  is_completed boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.helper_tasks enable row level security;

-- Trigger to auto-update updated_at (function exists already in project)
create trigger update_helper_tasks_updated_at
before update on public.helper_tasks
for each row execute function public.update_updated_at_column();

-- Indexes for performance
create index if not exists idx_helper_tasks_helper_id on public.helper_tasks(helper_id);
create index if not exists idx_helper_tasks_due_date on public.helper_tasks(due_date);

-- Policies: helpers can manage their own tasks
create policy "Helpers can view their tasks"
  on public.helper_tasks for select
  using (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
  );

create policy "Helpers can create their tasks"
  on public.helper_tasks for insert
  with check (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
  );

create policy "Helpers can update their tasks"
  on public.helper_tasks for update
  using (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
  );

create policy "Helpers can delete their tasks"
  on public.helper_tasks for delete
  using (
    helper_id = (
      select h.id from public.helpers h where h.user_id = auth.uid()
    )
  );