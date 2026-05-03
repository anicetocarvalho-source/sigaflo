import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CardExportJob {
  id: string;
  requested_by: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  error_message: string | null;
  options: Record<string, unknown>;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardExportJobLog {
  id: string;
  job_id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  farmer_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const useCardExportJobs = (limit = 20) => {
  return useQuery({
    queryKey: ['card-export-jobs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_export_jobs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as CardExportJob[];
    },
    refetchInterval: 4000,
  });
};

export const useCardExportJob = (jobId?: string) => {
  return useQuery({
    queryKey: ['card-export-job', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const { data, error } = await supabase
        .from('card_export_jobs' as any)
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CardExportJob | null;
    },
    enabled: !!jobId,
    refetchInterval: (q) => {
      const j = q.state.data as CardExportJob | null | undefined;
      return j && (j.status === 'processing' || j.status === 'pending') ? 2000 : false;
    },
  });
};

export const useCardExportJobLogs = (jobId?: string) => {
  return useQuery({
    queryKey: ['card-export-job-logs', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('card_export_job_logs' as any)
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as CardExportJobLog[];
    },
    enabled: !!jobId,
    refetchInterval: 3000,
  });
};

// Realtime opcional para logs ao vivo
export const useRealtimeJobLogs = (jobId?: string) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!jobId) return;
    const ch = supabase.channel(`job-logs-${jobId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'card_export_job_logs', filter: `job_id=eq.${jobId}` },
          () => setTick((t) => t + 1))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [jobId]);
  return tick;
};
