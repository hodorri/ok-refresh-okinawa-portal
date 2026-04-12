-- Add phone and passport fields to participants
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS passport_submitted TEXT DEFAULT '';
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS work_area TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS attendance TEXT;
