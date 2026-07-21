-- ═══════════════════════════════════════════════════════════════
-- Field Experience BHS — NEW TABLES ONLY
-- Run this if you already have teachers/students/bootcamp tables.
-- Safe to run multiple times (IF NOT EXISTS on all tables).
-- ═══════════════════════════════════════════════════════════════

-- WEEKLY LOGS
create table if not exists weekly_logs (
  id          uuid default gen_random_uuid() primary key,
  student_id  uuid references auth.users(id) on delete cascade not null,
  week_start  date not null,
  mon_location text, mon_supervisor text, mon_expected text, mon_actual numeric(4,2) default 0,
  tue_location text, tue_supervisor text, tue_expected text, tue_actual numeric(4,2) default 0,
  wed_location text, wed_supervisor text, wed_expected text, wed_actual numeric(4,2) default 0,
  thu_location text, thu_supervisor text, thu_expected text, thu_actual numeric(4,2) default 0,
  fri_location text, fri_supervisor text, fri_expected text, fri_actual numeric(4,2) default 0,
  sat_location text, sat_supervisor text, sat_expected text, sat_actual numeric(4,2) default 0,
  sun_location text, sun_supervisor text, sun_expected text, sun_actual numeric(4,2) default 0,
  total_projected    numeric(5,2) default 0,
  total_actual       numeric(5,2) default 0,
  key_task           text,
  projected_submitted_at timestamptz,
  actual_submitted_at    timestamptz,
  created_at             timestamptz default now(),
  unique(student_id, week_start)
);

-- WEEKLY REFLECTIONS
create table if not exists weekly_reflections (
  id                  uuid default gen_random_uuid() primary key,
  student_id          uuid references auth.users(id) on delete cascade not null,
  week_start          date not null,
  week_label          text,
  tasks_worked_on     text,
  key_learning        text,
  highlight           text,
  challenges          text,
  impact              text,
  improvement_focus   text,
  employability_skill text,
  skill_demonstration text,
  teacher_note        text,
  created_at          timestamptz default now(),
  unique(student_id, week_start)
);

-- PORTFOLIO ITEMS
create table if not exists portfolio_items (
  id          uuid default gen_random_uuid() primary key,
  student_id  uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  type        text not null,
  file_url    text,
  description text,
  created_at  timestamptz default now()
);

-- RLS for new tables only
alter table weekly_logs        enable row level security;
alter table weekly_reflections enable row level security;
alter table portfolio_items    enable row level security;

-- Drop any pre-existing policies on just these three tables
do $$
declare r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public'
    and tablename in ('weekly_logs','weekly_reflections','portfolio_items')
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- Weekly logs policies
create policy "Students manage own logs"
  on weekly_logs for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all logs"
  on weekly_logs for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- Weekly reflections policies
create policy "Students manage own reflections"
  on weekly_reflections for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all reflections"
  on weekly_reflections for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- Portfolio policies
create policy "Students manage own portfolio"
  on portfolio_items for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all portfolio"
  on portfolio_items for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));
