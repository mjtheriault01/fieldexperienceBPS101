-- ═══════════════════════════════════════════════════════════════
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Project: bsgrkpykysvqcdqikcym
-- Fixes: "Could not find the 'notes' column of 'bootcamp_progress'"
-- This was supposed to be run months ago (it's been sitting in
-- teacher-status.html's pending list) but never actually applied.
-- All statements are safe to re-run even if some already exist.
-- ═══════════════════════════════════════════════════════════════

alter table bootcamp_progress add column if not exists notes text;
alter table students add column if not exists semester_goal text;
alter table students add column if not exists launch_date timestamptz;
alter table students add column if not exists placement_name text;
