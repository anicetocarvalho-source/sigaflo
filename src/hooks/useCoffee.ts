import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CoffeeLot {
  id: string;
  lot_code: string;
  origin_province_id: string | null;
  origin_municipality_id: string | null;
  origin_commune_id: string | null;
  origin_location: string | null;
  producers_count: number;
  volume_kg: number;
  bags_count: number;
  variety: string | null;
  quality_grade: string | null;
  harvest_year: number | null;
  harvest_season: string | null;
  processing_method: string | null;
  exporter_id: string | null;
  exporter_name: string | null;
  buyer_name: string | null;
  destination_country: string | null;
  status: string;
  registered_at: string | null;
  dispatched_at: string | null;
  exported_at: string | null;
  export_declaration_number: string | null;
  transport_document_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  origin_province?: { name: string } | null;
  origin_municipality?: { name: string } | null;
}

export function useCoffeeLots(filters?: {
  provinceId?: string;
  exporterName?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['coffee-lots', filters],
    queryFn: async () => {
      let query = supabase
        .from('coffee_lots')
        .select(`
          *,
          origin_province:provinces!coffee_lots_origin_province_id_fkey(name),
          origin_municipality:municipalities!coffee_lots_origin_municipality_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.provinceId) {
        query = query.eq('origin_province_id', filters.provinceId);
      }

      if (filters?.exporterName) {
        query = query.eq('exporter_name', filters.exporterName);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`lot_code.ilike.%${filters.search}%,origin_location.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CoffeeLot[];
    },
  });
}

export function useCoffeeLot(id: string) {
  return useQuery({
    queryKey: ['coffee-lot', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_lots')
        .select(`
          *,
          origin_province:provinces!coffee_lots_origin_province_id_fkey(name),
          origin_municipality:municipalities!coffee_lots_origin_municipality_id_fkey(name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CoffeeLot;
    },
    enabled: !!id,
  });
}

export function useCreateCoffeeLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lot: Omit<CoffeeLot, 'id' | 'created_at' | 'updated_at' | 'origin_province' | 'origin_municipality'>) => {
      const { data, error } = await supabase
        .from('coffee_lots')
        .insert([lot])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coffee-lots'] });
      toast.success('Lote de café criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar lote: ' + error.message);
    },
  });
}

export function useUpdateCoffeeLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...lot }: Partial<CoffeeLot> & { id: string }) => {
      const { data, error } = await supabase
        .from('coffee_lots')
        .update(lot)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coffee-lots'] });
      toast.success('Lote actualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao actualizar lote: ' + error.message);
    },
  });
}

export function useCoffeeExporters() {
  return useQuery({
    queryKey: ['coffee-exporters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_lots')
        .select('exporter_name')
        .not('exporter_name', 'is', null)
        .order('exporter_name');
      if (error) throw error;
      // Get unique exporters
      const uniqueExporters = [...new Set(data.map(d => d.exporter_name))].filter(Boolean);
      return uniqueExporters as string[];
    },
  });
}
