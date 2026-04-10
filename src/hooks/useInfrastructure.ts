import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';

// Types
export interface AgriculturalInfrastructure {
  id: string;
  name: string;
  infrastructure_type: 'warehouse' | 'silo' | 'irrigation' | 'processing' | 'cold_storage' | 'logistics';
  province_id?: string;
  municipality_id?: string;
  commune_id?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  capacity_unit?: string;
  current_occupancy?: number;
  status: 'operational' | 'maintenance' | 'inactive' | 'construction';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  built_year?: number;
  last_inspection_date?: string;
  manager_name?: string;
  manager_contact?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  provinces?: { name: string };
  municipalities?: { name: string };
}

export interface MarketInfrastructure {
  id: string;
  name: string;
  market_type: 'wholesale' | 'retail' | 'fish_market' | 'agricultural_fair' | 'distribution_center' | 'livestock_market';
  province_id?: string;
  municipality_id?: string;
  commune_id?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity_sqm?: number;
  stalls_count?: number;
  current_occupancy?: number;
  vendors_count?: number;
  daily_visitors_estimate?: number;
  products?: string[];
  status: 'operational' | 'under_maintenance' | 'closed' | 'under_construction';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  last_inspection_date?: string;
  manager_name?: string;
  manager_contact?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  provinces?: { name: string };
  municipalities?: { name: string };
}

// Agricultural Infrastructure Hooks
export function useAgriculturalInfrastructure(filters?: {
  type?: string;
  status?: string;
  province_id?: string;
}) {
  return useQuery({
    queryKey: ['agricultural-infrastructure', filters],
    queryFn: async () => {
      let query = supabase
        .from('agricultural_infrastructure')
        .select(`
          *,
          provinces(name),
          municipalities(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('infrastructure_type', filters.type);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.province_id) {
        query = query.eq('province_id', filters.province_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AgriculturalInfrastructure[];
    },
  });
}

export function useCreateAgriculturalInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<AgriculturalInfrastructure, 'id' | 'created_at' | 'updated_at' | 'provinces' | 'municipalities'>) => {
      const { error, data: result } = await supabase
        .from('agricultural_infrastructure')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agricultural-infrastructure'] });
      toast.success('Infraestrutura registada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'infraestrutura', error));
    },
  });
}

export function useUpdateAgriculturalInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AgriculturalInfrastructure> & { id: string }) => {
      const { error, data: result } = await supabase
        .from('agricultural_infrastructure')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agricultural-infrastructure'] });
      toast.success('Infraestrutura actualizada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'infraestrutura', error));
    },
  });
}

export function useDeleteAgriculturalInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agricultural_infrastructure')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agricultural-infrastructure'] });
      queryClient.invalidateQueries({ queryKey: ['agricultural-infrastructure-stats'] });
      toast.success('Infraestrutura eliminada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('delete', 'infraestrutura', error));
    },
  });
}

// Market Infrastructure Hooks
export function useMarketInfrastructure(filters?: {
  type?: string;
  status?: string;
  province_id?: string;
}) {
  return useQuery({
    queryKey: ['market-infrastructure', filters],
    queryFn: async () => {
      let query = supabase
        .from('market_infrastructure')
        .select(`
          *,
          provinces(name),
          municipalities(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('market_type', filters.type);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.province_id) {
        query = query.eq('province_id', filters.province_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketInfrastructure[];
    },
  });
}

export function useCreateMarketInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<MarketInfrastructure, 'id' | 'created_at' | 'updated_at' | 'provinces' | 'municipalities'>) => {
      const { error, data: result } = await supabase
        .from('market_infrastructure')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-infrastructure'] });
      toast.success('Mercado registado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'mercado', error));
    },
  });
}

export function useUpdateMarketInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MarketInfrastructure> & { id: string }) => {
      const { error, data: result } = await supabase
        .from('market_infrastructure')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-infrastructure'] });
      toast.success('Mercado actualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'mercado', error));
    },
  });
}

export function useDeleteMarketInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('market_infrastructure')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-infrastructure'] });
      queryClient.invalidateQueries({ queryKey: ['market-infrastructure-stats'] });
      toast.success('Mercado eliminado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('delete', 'mercado', error));
    },
  });
}

// Stats Hooks
export function useAgriculturalInfrastructureStats() {
  return useQuery({
    queryKey: ['agricultural-infrastructure-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agricultural_infrastructure')
        .select('infrastructure_type, status, capacity, current_occupancy');

      if (error) throw error;

      const stats = {
        total: data.length,
        operational: data.filter(i => i.status === 'operational').length,
        totalCapacity: data.reduce((sum, i) => sum + (i.capacity || 0), 0),
        totalOccupancy: data.reduce((sum, i) => sum + (i.current_occupancy || 0), 0),
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
      };

      data.forEach(item => {
        stats.byType[item.infrastructure_type] = (stats.byType[item.infrastructure_type] || 0) + 1;
        stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      });

      return stats;
    },
  });
}

export function useMarketInfrastructureStats() {
  return useQuery({
    queryKey: ['market-infrastructure-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_infrastructure')
        .select('market_type, status, capacity_sqm, vendors_count, daily_visitors_estimate');

      if (error) throw error;

      const stats = {
        total: data.length,
        operational: data.filter(i => i.status === 'operational').length,
        totalVendors: data.reduce((sum, i) => sum + (i.vendors_count || 0), 0),
        totalVisitors: data.reduce((sum, i) => sum + (i.daily_visitors_estimate || 0), 0),
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
      };

      data.forEach(item => {
        stats.byType[item.market_type] = (stats.byType[item.market_type] || 0) + 1;
        stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      });

      return stats;
    },
  });
}
