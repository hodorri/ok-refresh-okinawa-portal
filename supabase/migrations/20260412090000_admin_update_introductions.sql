-- Allow admins to update any introduction
CREATE POLICY "Admins can update introductions" ON public.introductions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any comment
CREATE POLICY "Admins can delete comments" ON public.introduction_comments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
