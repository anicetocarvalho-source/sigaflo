import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type FarmerType = 'individual' | 'family' | 'cooperative' | 'field_school' | 'company';
export type WorkflowStatus = 'draft' | 'submitted' | 'validated' | 'approved' | 'issued' | 'rejected' | 'expired';

export interface Farmer {
  id: string;
  farmer_type: FarmerType;
  name: string;
  trade_name?: string;
  bi_nif?: string;
  phone?: string;
  email?: string;
  province_id?: string;
  municipality_id?: string;
  commune_id?: string;
  village?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  total_area_ha?: number;
  cultivated_area_ha?: number;
  main_crops?: string[];
  secondary_crops?: string[];
  irrigation_type?: string;
  parent_cooperative_id?: string;
  field_school_id?: string;
  registration_number?: string;
  registration_date?: string;
  status: WorkflowStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provinces?: { name: string; code: string };
  municipalities?: { name: string };
  communes?: { name: string };
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface Municipality {
  id: string;
  province_id: string;
  name: string;
  code?: string;
}

export interface Commune {
  id: string;
  municipality_id: string;
  name: string;
  code?: string;
}

export const useFarmers = (filters?: {
  type?: FarmerType;
  province_id?: string;
  status?: WorkflowStatus;
}) => {
  return useQuery({
    queryKey: ['farmers', filters],
    queryFn: async () => {
      let query = supabase
        .from('farmers')
        .select(`
          *,
          provinces(name, code),
          municipalities(name),
          communes(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('farmer_type', filters.type);
      }
      if (filters?.province_id) {
        query = query.eq('province_id', filters.province_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Farmer[];
    },
  });
};

export const useFarmer = (id: string) => {
  return useQuery({
    queryKey: ['farmer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmers')
        .select(`
          *,
          provinces(name, code),
          municipalities(name),
          communes(name)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Farmer | null;
    },
    enabled: !!id,
  });
};

export const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Province[];
    },
  });
};

export const useMunicipalities = (provinceId?: string) => {
  return useQuery({
    queryKey: ['municipalities', provinceId],
    queryFn: async () => {
      let query = supabase.from('municipalities').select('*').order('name');
      if (provinceId) {
        query = query.eq('province_id', provinceId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Municipality[];
    },
    enabled: !!provinceId,
  });
};

export const useCommunes = (municipalityId?: string) => {
  return useQuery({
    queryKey: ['communes', municipalityId],
    queryFn: async () => {
      let query = supabase.from('communes').select('*').order('name');
      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Commune[];
    },
    enabled: !!municipalityId,
  });
};

export const useCreateFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (farmer: Omit<Partial<Farmer>, 'id' | 'created_at' | 'updated_at' | 'registration_number' | 'provinces' | 'municipalities' | 'communes'>) => {
      const { data, error } = await supabase
        .from('farmers')
        .insert(farmer as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast.success('Registo criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar registo: ' + error.message);
    },
  });
};

export const useUpdateFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...farmer }: Partial<Farmer> & { id: string }) => {
      const { data, error } = await supabase
        .from('farmers')
        .update(farmer)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farmer', variables.id] });
      toast.success('Registo atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar registo: ' + error.message);
    },
  });
};

export const useFarmerStats = () => {
  return useQuery({
    queryKey: ['farmer-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmers')
        .select('farmer_type, status, province_id, provinces(name)');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        byProvince: {} as Record<string, number>,
      };
      
      data.forEach((farmer: any) => {
        stats.byType[farmer.farmer_type] = (stats.byType[farmer.farmer_type] || 0) + 1;
        stats.byStatus[farmer.status] = (stats.byStatus[farmer.status] || 0) + 1;
        if (farmer.provinces?.name) {
          stats.byProvince[farmer.provinces.name] = (stats.byProvince[farmer.provinces.name] || 0) + 1;
        }
      });
      
      return stats;
    },
  });
};
