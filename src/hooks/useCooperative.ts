import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';
import type { Farmer } from './useFarmers';

export interface CooperativeDetails {
  farmer_id: string;
  nif?: string | null;
  legal_constitution_date?: string | null;
  dncm_registration_number?: string | null;
  license_url?: string | null;
  statutes_url?: string | null;
  president_name?: string | null;
  president_phone?: string | null;
  secretary_name?: string | null;
  treasurer_name?: string | null;
  board_contacts?: any;
  degree?: 'first_degree' | 'second_degree' | null;
  total_members?: number | null;
  share_capital_aoa?: number | null;
  minimum_quota_aoa?: number | null;
  aggregated_area_ha?: number | null;
  infrastructures?: string[] | null;
  notes?: string | null;
}

export interface CooperativePayload {
  base: Partial<Farmer>;
  details: Partial<CooperativeDetails>;
  memberIds?: string[];
}

export const useCooperativeDetails = (farmerId?: string) => {
  return useQuery({
    queryKey: ['cooperative-details', farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const { data, error } = await supabase
        .from('cooperative_details')
        .select('*')
        .eq('farmer_id', farmerId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CooperativeDetails | null;
    },
    enabled: !!farmerId,
  });
};

export const useSaveCooperative = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, base, details, memberIds }: CooperativePayload & { id?: string }) => {
      const baseData = { ...base, farmer_type: 'cooperative' as const };
      let farmerId = id;
      const createdNew = !id;

      if (id) {
        const { error } = await supabase.from('farmers').update(baseData as any).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('farmers').insert(baseData as any).select().single();
        if (error) throw error;
        farmerId = data.id;
      }

      if (!farmerId) throw new Error('Falha ao obter ID da cooperativa');

      try {
        const detailsRow = { farmer_id: farmerId, ...details };
        const { error: dErr } = await supabase
          .from('cooperative_details')
          .upsert(detailsRow as any, { onConflict: 'farmer_id' });
        if (dErr) throw dErr;

        if (memberIds && memberIds.length > 0) {
          const { error: mErr } = await supabase
            .from('farmers')
            .update({ parent_cooperative_id: farmerId })
            .in('id', memberIds);
          if (mErr) throw mErr;
        }
      } catch (err) {
        // Compensação: se acabámos de criar a cooperativa, removemos para evitar registo órfão
        if (createdNew && farmerId) {
          await supabase.from('farmers').delete().eq('id', farmerId);
        }
        throw err;
      }

      return farmerId;
    },
    onSuccess: (farmerId) => {
      qc.invalidateQueries({ queryKey: ['farmers'] });
      qc.invalidateQueries({ queryKey: ['farmer', farmerId] });
      qc.invalidateQueries({ queryKey: ['cooperative-details', farmerId] });
      toast.success('Cooperativa guardada com sucesso');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'cooperativa', e)),
  });
};

export const useCooperativeDetailsBulk = (farmerIds: string[]) => {
  return useQuery({
    queryKey: ['cooperative-details-bulk', farmerIds.sort().join(',')],
    queryFn: async () => {
      if (farmerIds.length === 0) return {} as Record<string, CooperativeDetails>;
      const { data, error } = await supabase
        .from('cooperative_details')
        .select('*')
        .in('farmer_id', farmerIds);
      if (error) throw error;
      const map: Record<string, CooperativeDetails> = {};
      (data || []).forEach((row: any) => { map[row.farmer_id] = row; });
      return map;
    },
    enabled: farmerIds.length > 0,
  });
};
