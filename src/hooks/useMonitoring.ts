import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useMonitoring() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  // Calculate score for a farmer based on production, packages and mechanization
  const calculateScore = useMutation({
    mutationFn: async ({ farmerId, season }: { farmerId: string; season: string }) => {
      // Fetch production data
      const { data: production } = await supabase
        .from('production_history')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('season', season);

      // Fetch service orders
      const { data: orders } = await supabase
        .from('service_orders')
        .select('*')
        .eq('farmer_id', farmerId);

      // Fetch sales (packages)
      const { data: sales } = await supabase
        .from('pos_sales')
        .select('*')
        .eq('farmer_id', farmerId);

      // Calculate scores (0-25 each, total 0-100)
      const plantingScore = production?.length ? Math.min(25, production.length * 8) : 0;
      const packageScore = sales?.length ? Math.min(25, sales.length * 10) : 0;
      const mechScore = orders?.filter(o => o.status === 'completed' || o.status === 'validated').length
        ? Math.min(25, (orders.filter(o => o.status === 'completed' || o.status === 'validated').length) * 12)
        : 0;
      const prodScore = production?.reduce((s, p) => s + (p.actual_yield_kg || 0), 0) > 0
        ? Math.min(25, Math.round((production.reduce((s, p) => s + (p.actual_yield_kg || 0), 0) / 1000) * 5))
        : 0;
      const totalScore = plantingScore + packageScore + mechScore + prodScore;
      const complianceLevel = totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low';

      const { data, error } = await supabase
        .from('agricultural_scores')
        .upsert({
          farmer_id: farmerId,
          season,
          planting_score: plantingScore,
          package_score: packageScore,
          mechanization_score: mechScore,
          production_score: prodScore,
          total_score: totalScore,
          compliance_level: complianceLevel,
          calculated_at: new Date().toISOString(),
          calculated_by: user?.id || null,
        }, { onConflict: 'farmer_id,season' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agricultural_scores'] });
      toast.success('Score recalculado com sucesso');
    },
    onError: () => toast.error('Erro ao calcular score'),
  });

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
    calculateScore,
  };
}
