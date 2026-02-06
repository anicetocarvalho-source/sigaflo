import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';

export interface ProductionRecord {
  id: string;
  farmer_id: string;
  crop_type: string;
  season: string;
  year: number;
  area_planted_ha?: number;
  expected_yield_kg?: number;
  actual_yield_kg?: number;
  yield_per_ha?: number;
  harvest_date?: string;
  quality_grade?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  farmers?: {
    name: string;
    registration_number: string;
    farmer_type: string;
    provinces?: { name: string };
    municipalities?: { name: string };
  };
}

export interface ProductionFilters {
  farmer_id?: string;
  year?: number;
  season?: string;
  crop_type?: string;
}

export const useProductionRecords = (filters?: ProductionFilters) => {
  return useQuery({
    queryKey: ['production-records', filters],
    queryFn: async () => {
      let query = supabase
        .from('production_history')
        .select(`
          *,
          farmers(name, registration_number, farmer_type, provinces(name), municipalities(name))
        `)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.farmer_id) {
        query = query.eq('farmer_id', filters.farmer_id);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.season) {
        query = query.eq('season', filters.season);
      }
      if (filters?.crop_type) {
        query = query.eq('crop_type', filters.crop_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductionRecord[];
    },
  });
};

export const useProductionRecord = (id: string) => {
  return useQuery({
    queryKey: ['production-record', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_history')
        .select(`
          *,
          farmers(name, registration_number, farmer_type, provinces(name), municipalities(name))
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as ProductionRecord | null;
    },
    enabled: !!id,
  });
};

export const useCreateProductionRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<Partial<ProductionRecord>, 'id' | 'created_at' | 'updated_at' | 'yield_per_ha' | 'farmers'>) => {
      const { data, error } = await supabase
        .from('production_history')
        .insert(record as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-records'] });
      queryClient.invalidateQueries({ queryKey: ['production-stats'] });
      toast.success('Registo de produção criado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'registo de produção', error));
    },
  });
};

export const useUpdateProductionRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...record }: Partial<ProductionRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('production_history')
        .update(record)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production-records'] });
      queryClient.invalidateQueries({ queryKey: ['production-record', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['production-stats'] });
      toast.success('Registo atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'registo de produção', error));
    },
  });
};

export const useProductionStats = () => {
  return useQuery({
    queryKey: ['production-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_history')
        .select('*');

      if (error) throw error;

      const stats = {
        totalRecords: data.length,
        totalAreaHa: 0,
        totalProductionKg: 0,
        avgYieldPerHa: 0,
        byYear: {} as Record<number, { area: number; production: number; count: number }>,
        byCrop: {} as Record<string, { area: number; production: number; count: number }>,
        bySeason: {} as Record<string, { area: number; production: number; count: number }>,
        byQuality: {} as Record<string, number>,
      };

      let validYieldCount = 0;

      data.forEach((record: any) => {
        const area = record.area_planted_ha || 0;
        const production = record.actual_yield_kg || 0;
        const yieldPerHa = record.yield_per_ha || 0;

        stats.totalAreaHa += area;
        stats.totalProductionKg += production;

        if (yieldPerHa > 0) {
          stats.avgYieldPerHa += yieldPerHa;
          validYieldCount++;
        }

        // By year
        if (!stats.byYear[record.year]) {
          stats.byYear[record.year] = { area: 0, production: 0, count: 0 };
        }
        stats.byYear[record.year].area += area;
        stats.byYear[record.year].production += production;
        stats.byYear[record.year].count++;

        // By crop
        if (!stats.byCrop[record.crop_type]) {
          stats.byCrop[record.crop_type] = { area: 0, production: 0, count: 0 };
        }
        stats.byCrop[record.crop_type].area += area;
        stats.byCrop[record.crop_type].production += production;
        stats.byCrop[record.crop_type].count++;

        // By season
        if (!stats.bySeason[record.season]) {
          stats.bySeason[record.season] = { area: 0, production: 0, count: 0 };
        }
        stats.bySeason[record.season].area += area;
        stats.bySeason[record.season].production += production;
        stats.bySeason[record.season].count++;

        // By quality
        if (record.quality_grade) {
          stats.byQuality[record.quality_grade] = (stats.byQuality[record.quality_grade] || 0) + 1;
        }
      });

      if (validYieldCount > 0) {
        stats.avgYieldPerHa = stats.avgYieldPerHa / validYieldCount;
      }

      return stats;
    },
  });
};

export const useDistinctCrops = () => {
  return useQuery({
    queryKey: ['distinct-crops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_history')
        .select('crop_type');

      if (error) throw error;

      const crops = [...new Set(data.map((r: any) => r.crop_type))];
      return crops as string[];
    },
  });
};

export const useDistinctYears = () => {
  return useQuery({
    queryKey: ['distinct-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_history')
        .select('year');

      if (error) throw error;

      const years = [...new Set(data.map((r: any) => r.year))].sort((a, b) => b - a);
      return years as number[];
    },
  });
};
