-- 1. Validate employee_id exists in participants (callable by anon/anyone)
CREATE OR REPLACE FUNCTION public.validate_employee_id(_employee_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participants
    WHERE employee_id = _employee_id
    AND (status IS NULL OR status != 'cancelled')
  )
$$;

-- 2. Auto-link user to participant after signup
CREATE OR REPLACE FUNCTION public.link_user_to_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.participants
  SET user_id = NEW.id
  WHERE employee_id = NEW.raw_user_meta_data->>'employee_id'
    AND user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_link_participant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_user_to_participant();

-- 3. Allow anon to call validate_employee_id
GRANT EXECUTE ON FUNCTION public.validate_employee_id(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_employee_id(TEXT) TO authenticated;

-- 4. Allow authenticated users to read participants (for pre-fill)
-- Already exists via RLS policy "Participants viewable by authenticated"
