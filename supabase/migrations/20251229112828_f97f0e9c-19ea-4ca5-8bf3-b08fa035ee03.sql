-- Tighten SECURITY DEFINER role helper functions to prevent role enumeration

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false

    -- Allow users to check their own roles
    WHEN _user_id = auth.uid() THEN
      EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = _user_id
          AND ur.role = _role
      )

    -- Allow admins to check other users' roles
    WHEN EXISTS (
      SELECT 1
      FROM public.user_roles caller
      WHERE caller.user_id = auth.uid()
        AND caller.role = 'admin'::app_role
    ) THEN
      EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = _user_id
          AND ur.role = _role
      )

    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL

    -- Allow users to fetch their own role, and admins to fetch anyone's role
    WHEN _user_id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.user_roles caller
        WHERE caller.user_id = auth.uid()
          AND caller.role = 'admin'::app_role
      )
    THEN (
      SELECT ur.role
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
      ORDER BY
        CASE ur.role
          WHEN 'admin' THEN 1
          WHEN 'operations_engineer' THEN 2
          WHEN 'customer' THEN 3
        END
      LIMIT 1
    )

    ELSE NULL
  END;
$$;
