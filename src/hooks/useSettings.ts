import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/backend/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  critical_alerts_only: boolean;
  theme: string;
  compact_mode: boolean;
  animations_enabled: boolean;
  timezone: string;
  language: string;
  alert_incident_created: boolean;
  alert_incident_resolved: boolean;
  alert_resource_down: boolean;
  alert_sla_breach: boolean;
  alert_backup_failed: boolean;
  alert_security: boolean;
  data_retention_days: number;
  usage_analytics: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  id: string;
  org_name: string;
  org_slug: string | null;
  created_at: string;
  updated_at: string;
}

export type UserSettingsUpdate = Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>;

const defaultUserSettings: Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at"> = {
  email_notifications: true,
  push_notifications: true,
  critical_alerts_only: false,
  theme: "dark",
  compact_mode: false,
  animations_enabled: true,
  timezone: "UTC",
  language: "en",
  alert_incident_created: true,
  alert_incident_resolved: true,
  alert_resource_down: true,
  alert_sla_breach: true,
  alert_backup_failed: true,
  alert_security: true,
  data_retention_days: 90,
  usage_analytics: true,
};

export function useSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userSettingsQuery = useQuery({
    queryKey: ["userSettings", user?.id],
    queryFn: async (): Promise<UserSettings | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, create default settings
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id, ...defaultUserSettings })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const orgSettingsQuery = useQuery({
    queryKey: ["organizationSettings"],
    queryFn: async (): Promise<OrganizationSettings | null> => {
      const { data, error } = await supabase
        .from("organization_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateUserSettings = useMutation({
    mutationFn: async (updates: UserSettingsUpdate) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings", user?.id] });
      toast.success("Settings saved successfully");
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
      toast.error("Failed to save settings");
    },
  });

  const updateOrgSettings = useMutation({
    mutationFn: async (updates: Partial<OrganizationSettings>) => {
      // First check if org settings exist
      const { data: existing } = await supabase
        .from("organization_settings")
        .select("id")
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("organization_settings")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("organization_settings")
          .insert(updates)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationSettings"] });
      toast.success("Organization settings saved");
    },
    onError: (error) => {
      console.error("Failed to update org settings:", error);
      toast.error("Failed to save organization settings");
    },
  });

  return {
    userSettings: userSettingsQuery.data,
    orgSettings: orgSettingsQuery.data,
    isLoading: userSettingsQuery.isLoading || orgSettingsQuery.isLoading,
    isError: userSettingsQuery.isError || orgSettingsQuery.isError,
    updateUserSettings: updateUserSettings.mutate,
    updateOrgSettings: updateOrgSettings.mutate,
    isSaving: updateUserSettings.isPending || updateOrgSettings.isPending,
  };
}
