import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClimateOccurrence {
  id: string;
  occurrence_type: string;
  severity: string;
  title: string;
  description: string | null;
  province_id: string | null;
  municipality_id: string | null;
  commune_id: string | null;
  latitude: number | null;
  longitude: number | null;
  affected_area_ha: number | null;
  affected_farmers_count: number | null;
  estimated_loss_aoa: number | null;
  status: string;
  source: string;
  source_phone: string | null;
  ai_classification: any;
  best_practices: string[] | null;
  report_date: string;
  resolution_date: string | null;
  resolution_notes: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  provinces?: { name: string };
  municipalities?: { name: string };
}

export interface OccurrenceAlert {
  id: string;
  occurrence_id: string;
  alert_type: string;
  recipient_phone: string | null;
  recipient_email: string | null;
  message: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface OccurrenceSurvey {
  id: string;
  occurrence_id: string | null;
  survey_type: string;
  target_phone: string;
  farmer_id: string | null;
  province_id: string | null;
  questions: any;
  responses: any;
  status: string;
  sent_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ProvinceRiskMetrics {
  id: string;
  province_id: string;
  year: number;
  month: number;
  total_occurrences: number;
  critical_occurrences: number;
  high_occurrences: number;
  medium_occurrences: number;
  low_occurrences: number;
  total_affected_area_ha: number;
  total_affected_farmers: number;
  total_estimated_loss_aoa: number;
  risk_score: number;
  updated_at: string;
  provinces?: { name: string };
}

// Fetch all occurrences
export function useOccurrences() {
  return useQuery({
    queryKey: ['occurrences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('climate_occurrences')
        .select(`
          *,
          provinces:province_id(name),
          municipalities:municipality_id(name)
        `)
        .order('report_date', { ascending: false });
      
      if (error) throw error;
      return data as ClimateOccurrence[];
    }
  });
}

// Fetch single occurrence
export function useOccurrence(id: string | undefined) {
  return useQuery({
    queryKey: ['occurrence', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('climate_occurrences')
        .select(`
          *,
          provinces:province_id(name),
          municipalities:municipality_id(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ClimateOccurrence;
    },
    enabled: !!id
  });
}

// Fetch occurrence alerts
export function useOccurrenceAlerts(occurrenceId?: string) {
  return useQuery({
    queryKey: ['occurrence-alerts', occurrenceId],
    queryFn: async () => {
      let query = supabase
        .from('occurrence_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (occurrenceId) {
        query = query.eq('occurrence_id', occurrenceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OccurrenceAlert[];
    }
  });
}

// Fetch surveys
export function useOccurrenceSurveys(occurrenceId?: string) {
  return useQuery({
    queryKey: ['occurrence-surveys', occurrenceId],
    queryFn: async () => {
      let query = supabase
        .from('occurrence_surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (occurrenceId) {
        query = query.eq('occurrence_id', occurrenceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OccurrenceSurvey[];
    }
  });
}

// Fetch province risk metrics
export function useProvinceRiskMetrics(year?: number, month?: number) {
  return useQuery({
    queryKey: ['province-risk-metrics', year, month],
    queryFn: async () => {
      let query = supabase
        .from('province_risk_metrics')
        .select(`
          *,
          provinces:province_id(name)
        `)
        .order('risk_score', { ascending: false });
      
      if (year) query = query.eq('year', year);
      if (month) query = query.eq('month', month);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ProvinceRiskMetrics[];
    }
  });
}

// Create occurrence mutation
export function useCreateOccurrence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (occurrence: Partial<ClimateOccurrence>) => {
      const { data, error } = await supabase
        .from('climate_occurrences')
        .insert(occurrence as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['province-risk-metrics'] });
      toast.success('Ocorrência registada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao registar ocorrência: ' + error.message);
    }
  });
}

// Update occurrence mutation
export function useUpdateOccurrence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClimateOccurrence> & { id: string }) => {
      const { data, error } = await supabase
        .from('climate_occurrences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['province-risk-metrics'] });
      toast.success('Ocorrência atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar ocorrência: ' + error.message);
    }
  });
}

// Classify occurrence using AI
export function useClassifyOccurrence() {
  return useMutation({
    mutationFn: async (data: {
      occurrence_type: string;
      description: string;
      affected_area_ha?: number;
      affected_farmers_count?: number;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('occurrence-ai', {
        body: { action: 'classify', ...data }
      });
      
      if (error) throw error;
      return result;
    }
  });
}

// Simulate SMS inbound
export function useSimulateSmsInbound() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { phone: string; message: string }) => {
      const { data: result, error } = await supabase.functions.invoke('occurrence-ai', {
        body: { action: 'simulate_sms_inbound', ...data }
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      toast.success('SMS recebido e processado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao processar SMS: ' + error.message);
    }
  });
}

// Send alert
export function useSendAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { occurrence_id: string; phones: string[]; message: string }) => {
      const { data: result, error } = await supabase.functions.invoke('occurrence-ai', {
        body: { action: 'send_alert', ...data }
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrence-alerts'] });
      toast.success('Alertas SMS enviados com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar alertas: ' + error.message);
    }
  });
}

// Create survey
export function useCreateSurvey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      survey_type: string;
      target_phones: string[];
      province_id?: string;
      occurrence_id?: string;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('occurrence-ai', {
        body: { action: 'create_survey', ...data }
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrence-surveys'] });
      toast.success('Inquéritos criados e enviados com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar inquéritos: ' + error.message);
    }
  });
}
