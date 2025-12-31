-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  role app_role NOT NULL DEFAULT 'customer',
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique constraint on pending invitations per email
CREATE UNIQUE INDEX idx_team_invitations_pending_email 
ON public.team_invitations (email) 
WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Ops engineers and admins can view all invitations
CREATE POLICY "Ops/admin can view invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
);

-- Ops engineers and admins can create invitations
CREATE POLICY "Ops/admin can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
);

-- Ops engineers and admins can update invitations
CREATE POLICY "Ops/admin can update invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'operations_engineer'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
BEFORE UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();