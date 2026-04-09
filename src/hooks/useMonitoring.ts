import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMonitoring() {
  const queryClient = useQueryClient();

  // Alerts
  const alertsQuery = useQuery({
    queryKey: ['monitoring_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_alerts')
        .select('*, provinces(name), municipalities(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createAlert = useMutation({
    mutationFn: async (alert: any) => {
      const { data, error } = await supabase
        .from('monitoring_alerts')
        .insert({ ...alert, alert_number: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring_alerts'] });
      toast.success('Alerta criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar alerta'),
  });

  const updateAlert = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('monitoring_alerts').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring_alerts'] });
      toast.success('Alerta actualizado');
    },
    onError: () => toast.error('Erro ao actualizar alerta'),
  });

  // SMS received
  const smsReceivedQuery = useQuery({
    queryKey: ['sms_received'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_received')
        .select('*, provinces(name)')
        .order('received_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // SMS sent
  const smsSentQuery = useQuery({
    queryKey: ['sms_sent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_sent')
        .select('*, provinces(name), municipalities(name)')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const sendSms = useMutation({
    mutationFn: async (sms: any) => {
      const { data, error } = await supabase.from('sms_sent').insert(sms).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms_sent'] });
      toast.success('SMS enviado');
    },
    onError: () => toast.error('Erro ao enviar SMS'),
  });

  // Agricultural Scores
  const scoresQuery = useQuery({
    queryKey: ['agricultural_scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agricultural_scores')
        .select('*, farmers(name, registration_number, provinces(name))')
        .order('total_score', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // NDVI
  const ndviQuery = useQuery({
    queryKey: ['ndvi_readings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ndvi_readings')
        .select('*, farmers(name)')
        .order('reading_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // Stats
  const alertStats = {
    total: alertsQuery.data?.length || 0,
    pending: alertsQuery.data?.filter((a: any) => a.response_status === 'pending').length || 0,
    critical: alertsQuery.data?.filter((a: any) => a.severity === 'critical').length || 0,
    resolved: alertsQuery.data?.filter((a: any) => a.response_status === 'resolved').length || 0,
  };

  const scoreStats = {
    total: scoresQuery.data?.length || 0,
    highCompliance: scoresQuery.data?.filter((s: any) => s.compliance_level === 'high').length || 0,
    mediumCompliance: scoresQuery.data?.filter((s: any) => s.compliance_level === 'medium').length || 0,
    lowCompliance: scoresQuery.data?.filter((s: any) => s.compliance_level === 'low').length || 0,
    avgScore: scoresQuery.data?.length
      ? Math.round(scoresQuery.data.reduce((sum: number, s: any) => sum + Number(s.total_score || 0), 0) / scoresQuery.data.length)
      : 0,
  };

  return {
    alerts: alertsQuery.data || [],
    alertsLoading: alertsQuery.isLoading,
    alertStats,
    createAlert,
    updateAlert,
    smsReceived: smsReceivedQuery.data || [],
    smsReceivedLoading: smsReceivedQuery.isLoading,
    smsSent: smsSentQuery.data || [],
    smsSentLoading: smsSentQuery.isLoading,
    sendSms,
    scores: scoresQuery.data || [],
    scoresLoading: scoresQuery.isLoading,
    scoreStats,
    ndviReadings: ndviQuery.data || [],
    ndviLoading: ndviQuery.isLoading,
  };
}
