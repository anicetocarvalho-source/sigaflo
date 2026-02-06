import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getCrudErrorMessage } from '@/lib/errorMessages';

// Types
export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  default_province_id?: string;
  dashboard_layout: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// System Settings Hooks
export function useSystemSettings(category?: string) {
  return useQuery({
    queryKey: ['system-settings', category],
    queryFn: async () => {
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

export function useSystemSetting(key: string) {
  return useQuery({
    queryKey: ['system-setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', key)
        .maybeSingle();
      if (error) throw error;
      return data as SystemSetting | null;
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: Record<string, any>; description?: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          description,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'setting_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-setting'] });
      toast.success('Configuração guardada');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'configuração', error));
    },
  });
}

// User Preferences Hooks
export function useUserPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserPreferences | null;
    },
    enabled: !!user,
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      // First try to update
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_preferences')
          .update({ ...preferences, updated_at: new Date().toISOString() })
          .eq('user_id', user?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({ user_id: user?.id, ...preferences });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success('Preferências guardadas');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'preferências', error));
    },
  });
}

// Specific preference shortcuts
export function useThemePreference() {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences.mutate({ theme });
  };

  return {
    theme: preferences?.theme || 'system',
    setTheme,
    isLoading: updatePreferences.isPending,
  };
}

export function useNotificationPreferences() {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  const setNotificationPreferences = (prefs: {
    notifications_email?: boolean;
    notifications_push?: boolean;
    notifications_sms?: boolean;
  }) => {
    updatePreferences.mutate(prefs);
  };

  return {
    email: preferences?.notifications_email ?? true,
    push: preferences?.notifications_push ?? true,
    sms: preferences?.notifications_sms ?? false,
    setNotificationPreferences,
    isLoading: updatePreferences.isPending,
  };
}
