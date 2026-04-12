-- Allow admins to delete any introduction
CREATE POLICY "Admins can delete introductions" ON public.introductions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
