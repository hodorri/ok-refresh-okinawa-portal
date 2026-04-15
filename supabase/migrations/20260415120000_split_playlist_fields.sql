ALTER TABLE public.introductions ADD COLUMN IF NOT EXISTS playlist_artist TEXT;
ALTER TABLE public.introductions ADD COLUMN IF NOT EXISTS playlist_title TEXT;
ALTER TABLE public.introductions ADD COLUMN IF NOT EXISTS playlist_url TEXT;
