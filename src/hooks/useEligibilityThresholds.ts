import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';

export type EligibilityAlertSeverity = 'info' | 'warning' | 'error';
export type EligibilityAlertTarget = 'farmer_cards' | 'farmer_wallets' | '*';

export interface EligibilityAlertThreshold {
  id: string;
  target_table: EligibilityAlertTarget;
  farmer_type: string; // farmer_type value or '*'
  reason_pattern: string; // ILIKE pattern or '*'
  window_minutes: number;
  min_absolute_count: number;
  baseline_multiplier: number;
  baseline_days: number;
  severity: EligibilityAlertSeverity;
  is_active: boolean;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type EligibilityAlertThresholdInput = Omit<
  EligibilityAlertThreshold,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
>;

const TABLE = 'eligibility_alert_thresholds';

/**
 * Lista todos os limiares configuráveis para alertas de bloqueio de elegibilidade.
 * Acesso restrito (RLS) a técnicos (read) e admins (write).
 */
export function useEligibilityThresholds() {
  return useQuery({
    queryKey: ['eligibility-alert-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE as any)
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as EligibilityAlertThreshold[];
    },
  });
}

export function useUpsertEligibilityThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<EligibilityAlertThreshold> & EligibilityAlertThresholdInput) => {
      const { data, error } = await supabase
        .from(TABLE as any)
        .upsert(input as any, { onConflict: 'target_table,farmer_type,reason_pattern' })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as EligibilityAlertThreshold;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eligibility-alert-thresholds'] });
      toast.success('Limiar guardado');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'limiar de alerta', error));
    },
  });
}

export function useDeleteEligibilityThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eligibility-alert-thresholds'] });
      toast.success('Limiar removido');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('delete', 'limiar de alerta', error));
    },
  });
}

/**
 * Dispara manualmente a detecção de anomalias usando os limiares configurados.
 * Cria notificações em system_notifications quando algum limite é excedido.
 */
export function useRunAnomalyDetection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('detect_eligibility_block_anomalies' as any);
      if (error) throw error;
      return (data as number) ?? 0;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notification-stats'] });
      toast.success(
        count > 0
          ? `${count} novo(s) alerta(s) gerado(s)`
          : 'Sem anomalias detectadas no momento'
      );
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('read', 'anomalias', error));
    },
  });
}
