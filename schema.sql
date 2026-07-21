-- ═══════════════════════════════════════════════════════════════
-- Field Experience BHS — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Project: bsgrkpykysvqcdqikcym
-- ═══════════════════════════════════════════════════════════════

-- 1. TEACHERS
create table if not exists teachers (
  id         uuid default gen_random_uuid() primary key,
  email      text unique not null,
  name       text,
  created_at timestamptz default now()
);

-- Add yourself — update email if needed
insert into teachers (email, name)
values ('michael.theriault@bps101.net', 'Michael Theriault')
on conflict (email) do nothing;

-- 2. STUDENTS
create table if not exists students (
  id                 uuid references auth.users(id) on delete cascade primary key,
  email              text,
  first_name         text,
  last_name          text,
  placement_employer text,
  placement_address  text,
  hours_goal         int default 60,
  created_at         timestamptz default now()
);

-- 3. WEEKLY LOGS
create table if not exists weekly_logs (
  id          uuid default gen_random_uuid() primary key,
  student_id  uuid references auth.users(id) on delete cascade not null,
  week_start  date not null,
  -- Monday
  mon_location text, mon_supervisor text, mon_expected text, mon_actual numeric(4,2) default 0,
  -- Tuesday
  tue_location text, tue_supervisor text, tue_expected text, tue_actual numeric(4,2) default 0,
  -- Wednesday
  wed_location text, wed_supervisor text, wed_expected text, wed_actual numeric(4,2) default 0,
  -- Thursday
  thu_location text, thu_supervisor text, thu_expected text, thu_actual numeric(4,2) default 0,
  -- Friday
  fri_location text, fri_supervisor text, fri_expected text, fri_actual numeric(4,2) default 0,
  -- Saturday
  sat_location text, sat_supervisor text, sat_expected text, sat_actual numeric(4,2) default 0,
  -- Sunday
  sun_location text, sun_supervisor text, sun_expected text, sun_actual numeric(4,2) default 0,
  -- Totals
  total_projected    numeric(5,2) default 0,
  total_actual       numeric(5,2) default 0,
  -- Summary
  key_task           text,
  -- Submission phases (projected = Sunday before; actual = Sunday after)
  projected_submitted_at timestamptz,
  actual_submitted_at    timestamptz,
  created_at             timestamptz default now(),
  unique(student_id, week_start)
);

-- 4. WEEKLY REFLECTIONS
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

-- 5. BOOTCAMP PROGRESS
create table if not exists bootcamp_progress (
  id           uuid default gen_random_uuid() primary key,
  student_id   uuid references auth.users(id) on delete cascade not null,
  task_id      text not null,
  phase        int  not null,
  notes        text,
  completed_at timestamptz default now(),
  unique(student_id, task_id)
);

-- 6. PORTFOLIO ITEMS
create table if not exists portfolio_items (
  id          uuid default gen_random_uuid() primary key,
  student_id  uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  type        text not null,
  file_url    text,
  description text,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table teachers           enable row level security;
alter table students           enable row level security;
alter table weekly_logs        enable row level security;
alter table weekly_reflections enable row level security;
alter table bootcamp_progress  enable row level security;
alter table portfolio_items    enable row level security;

-- Drop ALL existing policies on these tables (safe to re-run regardless of policy names)
do $$
declare r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public'
    and tablename in ('teachers','students','weekly_logs','weekly_reflections','bootcamp_progress','portfolio_items')
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- TEACHERS: any authenticated user can read (needed for role check in login.html)
create policy "Authenticated read teachers"
  on teachers for select to authenticated using (true);

-- STUDENTS: own row only; teachers read all
create policy "Students manage own profile"
  on students for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Teachers read all students"
  on students for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- WEEKLY LOGS: own rows; teachers read all
create policy "Students manage own logs"
  on weekly_logs for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all logs"
  on weekly_logs for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- WEEKLY REFLECTIONS: own rows; teachers read all
create policy "Students manage own reflections"
  on weekly_reflections for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all reflections"
  on weekly_reflections for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- BOOTCAMP PROGRESS: own rows; teachers read all
create policy "Students manage own progress"
  on bootcamp_progress for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all progress"
  on bootcamp_progress for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- PORTFOLIO: own rows; teachers read all
create policy "Students manage own portfolio"
  on portfolio_items for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all portfolio"
  on portfolio_items for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));

-- 7. SKILL ASSESSMENTS (added — see schema-add-skill-assessments.sql)
create table if not exists skill_assessments (
  id                  uuid default gen_random_uuid() primary key,
  student_id          uuid references auth.users(id) on delete cascade not null,
  assessment_type     text not null check (assessment_type in ('pre','post')),
  ratings             jsonb not null,
  career_interests    text,
  professional_goal   text,
  reflection          text,
  created_at          timestamptz default now(),
  unique(student_id, assessment_type)
);

alter table skill_assessments enable row level security;

create policy "Students manage own skill assessments"
  on skill_assessments for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all skill assessments"
  on skill_assessments for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));
