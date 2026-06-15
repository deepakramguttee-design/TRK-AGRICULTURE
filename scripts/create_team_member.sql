CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_team_member(
  p_email     text,
  p_password  text,
  p_full_name text,
  p_role      text DEFAULT 'employe'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid         uuid;
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Reservé aux admins';
  END IF;
  IF p_role NOT IN ('admin', 'employe') THEN
    RAISE EXCEPTION 'Role invalide : %', p_role;
  END IF;

  v_uid := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data,
    created_at, updated_at, role, aud
  ) VALUES (
    v_uid,
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_full_name),
    '{"provider":"email","providers":["email"]}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  INSERT INTO public.profiles (id, role, email, full_name)
  VALUES (v_uid, p_role, p_email, p_full_name);

  RETURN v_uid;
END;
$$;
