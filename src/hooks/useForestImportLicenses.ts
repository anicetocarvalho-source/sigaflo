import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ForestImportLicense = Tables<'forest_import_licenses'> & {
  provinces?: { name: string } | null;
};

export function useForestImportLicenses(filters?: { status?: string; person_type?: string; category?: string }) {
  return useQuery({
    queryKey: ['forest-import-licenses', filters],
    queryFn: async () => {
      let q = supabase
        .from('forest_import_licenses')
        .select('*, provinces(name)')
        .order('created_at', { ascending: false });
      if (filters?.status) q = q.eq('status', filters.status as ForestImportLicense['status']);
      if (filters?.person_type) q = q.eq('person_type', filters.person_type as ForestImportLicense['person_type']);
      if (filters?.category) q = q.eq('product_category', filters.category as ForestImportLicense['product_category']);
      const { data, error } = await q;
      if (error) throw error;
      return data as ForestImportLicense[];
    },
  });
}

export function useCreateImportLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TablesInsert<'forest_import_licenses'>) => {
      const { data, error } = await supabase.from('forest_import_licenses').insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-import-licenses'] });
      toast.success('Licença de importação criada com sucesso');
    },
    onError: (e) => toast.error(getCrudErrorMessage('create', 'licença de importação', e)),
  });
}

export function useUpdateImportLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'forest_import_licenses'> & { id: string }) => {
      const { data, error } = await supabase.from('forest_import_licenses').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-import-licenses'] });
      toast.success('Licença actualizada');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'licença de importação', e)),
  });
}

export function useDeleteImportLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('forest_import_licenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-import-licenses'] });
      toast.success('Licença eliminada');
    },
    onError: (e) => toast.error(getCrudErrorMessage('delete', 'licença de importação', e)),
  });
}
