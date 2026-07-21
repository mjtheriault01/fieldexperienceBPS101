-- ═══════════════════════════════════════════════════════════════
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Project: bsgrkpykysvqcdqikcym
-- Adds: skill_assessments table for the Phase 1 pre-assessment /
-- Phase 3 post-assessment self-assessment tool (self-assessment.html)
-- ═══════════════════════════════════════════════════════════════

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

do $$
declare r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename = 'skill_assessments'
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "Students manage own skill assessments"
  on skill_assessments for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Teachers read all skill assessments"
  on skill_assessments for select to authenticated
  using (exists (select 1 from teachers where email = (auth.jwt()->>'email')));
