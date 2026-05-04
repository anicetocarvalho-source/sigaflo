import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type EligibilityBlockTarget = 'farmer_cards' | 'farmer_wallets';

export interface EligibilityBlockLogRow {
  id: string;
  target_table: EligibilityBlockTarget;
  farmer_id: string | null;
  farmer_type: string | null;
  reason: string;
  attempted_payload: Record<string, unknown> | null;
  attempted_by: string | null;
  created_at: string;
}

interface UseEligibilityBlockLogParams {
  farmerId?: string;
  target?: EligibilityBlockTarget;
  limit?: number;
}

/**
 * Lista bloqueios de elegibilidade registados pelos triggers de cartão/carteira.
 * Acesso restrito (RLS) a técnicos e administradores.
 */
export const useEligibilityBlockLog = (params: UseEligibilityBlockLogParams = {}) => {
  const { farmerId, target, limit = 100 } = params;
  return useQuery({
    queryKey: ['eligibility-block-log', { farmerId, target, limit }],
    queryFn: async () => {
      let q = supabase
        .from('eligibility_block_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (farmerId) q = q.eq('farmer_id', farmerId);
      if (target) q = q.eq('target_table', target);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as EligibilityBlockLogRow[];
    },
  });
};
