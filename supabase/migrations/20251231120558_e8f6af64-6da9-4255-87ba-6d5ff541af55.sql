-- Create user_settings table for user-specific preferences
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  critical_alerts_only boolean NOT NULL DEFAULT false,
  theme text NOT NULL DEFAULT 'dark',
  compact_mode boolean NOT NULL DEFAULT false,
  animations_enabled boolean NOT NULL DEFAULT true,
  timezone text NOT NULL DEFAULT 'UTC',
  language text NOT NULL DEFAULT 'en',
  alert_incident_created boolean NOT NULL DEFAULT true,
  alert_incident_resolved boolean NOT NULL DEFAULT true,
  alert_resource_down boolean NOT NULL DEFAULT true,
  alert_sla_breach boolean NOT NULL DEFAULT true,
  alert_backup_failed boolean NOT NULL DEFAULT true,
  alert_security boolean NOT NULL DEFAULT true,
  data_retention_days integer NOT NULL DEFAULT 90,
  usage_analytics boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create organization_settings table for org-wide settings
CREATE TABLE public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL DEFAULT 'My Organization',
  org_slug text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings: users can manage their own settings
CREATE POLICY "Users can view their own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for organization_settings: all authenticated can read, admins can write
CREATE POLICY "Authenticated users can view organization settings"
ON public.organization_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage organization settings"
ON public.organization_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on organization_settings
CREATE TRIGGER update_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();