-- Add student_email and student_name to submission tables
-- Run in Supabase SQL Editor before pushing the new pages
alter table weekly_logs        add column if not exists student_email text;
alter table weekly_logs        add column if not exists student_name  text;
alter table weekly_reflections add column if not exists student_email text;
alter table weekly_reflections add column if not exists student_name  text;
