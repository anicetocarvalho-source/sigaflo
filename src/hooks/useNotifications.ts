import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'system' | 'farmers' | 'certificates' | 'occurrences' | 'forestry' | 'coffee' | 'incentives' | 'credit' | 'infrastructure';

export interface SystemNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  category: NotificationCategory;
  link?: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export function useNotifications(options?: {
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id, options],
    queryFn: async () => {
      let query = supabase
        .from('system_notifications')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SystemNotification[];
    },
    enabled: !!user,
  });
}

export function useNotificationStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('is_read, is_starred, created_at')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .eq('is_archived', false);

      if (error) throw error;

      const today = new Date().toDateString();
      return {
        total: data.length,
        unread: data.filter(n => !n.is_read).length,
        starred: data.filter(n => n.is_starred).length,
        today: data.filter(n => new Date(n.created_at).toDateString() === today).length,
      };
    },
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      toast.success('Todas as notificações marcadas como lidas');
    },
  });
}

export function useToggleNotificationStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, starred }: { id: string; starred: boolean }) => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_starred: starred })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_archived: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      toast.success('Notificação arquivada');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      toast.success('Notificação removida');
    },
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Omit<SystemNotification, 'id' | 'created_at' | 'is_read' | 'is_starred' | 'is_archived'>) => {
      const { error, data } = await supabase
        .from('system_notifications')
        .insert(notification)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

// Real-time notifications hook
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newNotification, setNewNotification] = useState<SystemNotification | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as SystemNotification;
          setNewNotification(notification);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
          
          // Show toast for new notifications
          toast(notification.title, {
            description: notification.message,
            action: notification.link ? {
              label: 'Ver',
              onClick: () => window.location.href = notification.link!,
            } : undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return { newNotification };
}
