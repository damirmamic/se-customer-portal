-- Allow operations engineers (and admins) to manage organization settings
-- (This project currently has only operations_engineer roles, so admin-only policies block all writes.)

DROP POLICY IF EXISTS "Admins can insert organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Admins can update organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Admins can delete organization settings" ON public.organization_settings;

CREATE POLICY "Ops/admin can insert organization settings"
ON public.organization_settings
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
);

CREATE POLICY "Ops/admin can update organization settings"
ON public.organization_settings
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
);

CREATE POLICY "Ops/admin can delete organization settings"
ON public.organization_settings
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
);