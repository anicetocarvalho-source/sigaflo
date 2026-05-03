import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';
import type { Farmer } from './useFarmers';

export interface FieldSchoolDetails {
  farmer_id: string;
  facilitator_id?: string | null;
  start_date?: string | null;
  duration_months?: number | null;
  curriculum_modules?: string[] | null;
  focus_crop?: string | null;
  participants_count?: number | null;
  participants_male?: number | null;
  participants_female?: number | null;
  avg_age_range?: string | null;
  avg_education_level?: string | null;
  promoter_entity?: string | null;
  promoter_name?: string | null;
  funding_source?: string | null;
  linked_project?: string | null;
  demo_parcel_area_ha?: number | null;
  demo_crops?: string[] | null;
  session_schedule?: any;
  demo_latitude?: number | null;
  demo_longitude?: number | null;
  notes?: string | null;
}

export interface FieldSchoolPayload {
  base: Partial<Farmer>;
  details: Partial<FieldSchoolDetails>;
  memberIds?: string[];
}

export const useFieldSchoolDetails = (farmerId?: string) => {
  return useQuery({
    queryKey: ['field-school-details', farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const { data, error } = await supabase
        .from('field_school_details')
        .select('*')
        .eq('farmer_id', farmerId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as FieldSchoolDetails | null;
    },
    enabled: !!farmerId,
  });
};

export const useSaveFieldSchool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, base, details, memberIds }: FieldSchoolPayload & { id?: string }) => {
      const baseData = { ...base, farmer_type: 'field_school' as const };
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

      if (!farmerId) throw new Error('Falha ao obter ID da escola de campo');

      try {
        const detailsRow = { farmer_id: farmerId, ...details };
        const { error: dErr } = await supabase
          .from('field_school_details')
          .upsert(detailsRow as any, { onConflict: 'farmer_id' });
        if (dErr) throw dErr;

        if (memberIds && memberIds.length > 0) {
          const { error: mErr } = await supabase
            .from('farmers')
            .update({ field_school_id: farmerId })
            .in('id', memberIds);
          if (mErr) throw mErr;
        }
      } catch (err) {
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
      qc.invalidateQueries({ queryKey: ['field-school-details', farmerId] });
      toast.success('Escola de Campo guardada com sucesso');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'escola de campo', e)),
  });
};
