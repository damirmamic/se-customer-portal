-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Authenticated users can view organization settings" ON public.organization_settings;

-- Create PERMISSIVE policies (default behavior)
CREATE POLICY "Authenticated users can view organization settings"
ON public.organization_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert organization settings"
ON public.organization_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update organization settings"
ON public.organization_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete organization settings"
ON public.organization_settings
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));