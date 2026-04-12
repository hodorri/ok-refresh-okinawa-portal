-- Add attachments JSONB column to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for announcement files
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for announcements bucket
CREATE POLICY "Announcement files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'announcements');
CREATE POLICY "Admins can upload announcement files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update announcement files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete announcement files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));
