import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Database types
export type ForestOperator = Tables<'forest_operators'> & {
  provinces?: { name: string } | null;
};

export type ForestLicense = Tables<'forest_licenses'> & {
  forest_operators?: { name: string; nif: string } | null;
  provinces?: { name: string } | null;
};

export type ForestTree = Tables<'forest_trees'>;

export type ForestLog = Tables<'forest_logs'> & {
  forest_trees?: { tree_code: string; species: string } | null;
};

export type ForestTransportPermit = Tables<'forest_transport_permits'> & {
  forest_operators?: { name: string } | null;
  forest_licenses?: { license_number: string } | null;
};

export type ForestInfraction = Tables<'forest_infractions'> & {
  provinces?: { name: string } | null;
  forest_operators?: { name: string } | null;
};

export type ForestComplaint = Tables<'forest_complaints'> & {
  provinces?: { name: string } | null;
};

export type ForestNursery = Tables<'forest_nurseries'> & {
  provinces?: { name: string } | null;
};

export type ForestReforestationProgram = Tables<'forest_reforestation_programs'> & {
  provinces?: { name: string } | null;
};

// Operators
export function useForestOperators() {
  return useQuery({
    queryKey: ['forest-operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_operators')
        .select('*, provinces(name)')
        .order('name');
      if (error) throw error;
      return data as ForestOperator[];
    },
  });
}

export function useCreateOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (operator: TablesInsert<'forest_operators'>) => {
      const { data, error } = await supabase
        .from('forest_operators')
        .insert([operator])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-operators'] });
      toast.success('Operador criado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'operador', error));
    },
  });
}

// Licenses
export function useForestLicenses(filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['forest-licenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('forest_licenses')
        .select('*, forest_operators(name, nif), provinces(name)')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status as ForestLicense['status']);
      }
      if (filters?.type) {
        query = query.eq('license_type', filters.type as ForestLicense['license_type']);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ForestLicense[];
    },
  });
}

export function useForestLicense(id: string) {
  return useQuery({
    queryKey: ['forest-license', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_licenses')
        .select('*, forest_operators(name, nif), provinces(name), municipalities(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ForestLicense;
    },
    enabled: !!id,
  });
}

export function useCreateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (license: TablesInsert<'forest_licenses'>) => {
      const { data, error } = await supabase
        .from('forest_licenses')
        .insert([license])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-licenses'] });
      toast.success('Licença criada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'licença', error));
    },
  });
}

export function useUpdateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'forest_licenses'> & { id: string }) => {
      const { data, error } = await supabase
        .from('forest_licenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forest-licenses'] });
      queryClient.invalidateQueries({ queryKey: ['forest-license', variables.id] });
      toast.success('Licença actualizada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'licença', error));
    },
  });
}

// Trees
export function useForestTrees(licenseId?: string) {
  return useQuery({
    queryKey: ['forest-trees', licenseId],
    queryFn: async () => {
      let query = supabase
        .from('forest_trees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (licenseId) {
        query = query.eq('license_id', licenseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ForestTree[];
    },
  });
}

export function useCreateTree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tree: TablesInsert<'forest_trees'>) => {
      const { data, error } = await supabase
        .from('forest_trees')
        .insert([tree])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-trees'] });
      toast.success('Árvore registada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'árvore', error));
    },
  });
}

// Logs
export function useForestLogs(licenseId?: string) {
  return useQuery({
    queryKey: ['forest-logs', licenseId],
    queryFn: async () => {
      let query = supabase
        .from('forest_logs')
        .select('*, forest_trees(tree_code, species)')
        .order('created_at', { ascending: false });
      
      if (licenseId) {
        query = query.eq('license_id', licenseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ForestLog[];
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: TablesInsert<'forest_logs'>) => {
      const { data, error } = await supabase
        .from('forest_logs')
        .insert([log])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-logs'] });
      toast.success('Tora registada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'tora', error));
    },
  });
}

// Transport Permits
export function useTransportPermits() {
  return useQuery({
    queryKey: ['forest-transport-permits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_transport_permits')
        .select('*, forest_operators(name), forest_licenses(license_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ForestTransportPermit[];
    },
  });
}

export function useCreateTransportPermit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permit: TablesInsert<'forest_transport_permits'>) => {
      const { data, error } = await supabase
        .from('forest_transport_permits')
        .insert([permit])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-transport-permits'] });
      toast.success('Guia de transporte criada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'guia de transporte', error));
    },
  });
}

// Infractions
export function useForestInfractions() {
  return useQuery({
    queryKey: ['forest-infractions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_infractions')
        .select('*, provinces(name), forest_operators(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ForestInfraction[];
    },
  });
}

export function useCreateInfraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (infraction: TablesInsert<'forest_infractions'>) => {
      const { data, error } = await supabase
        .from('forest_infractions')
        .insert([infraction])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-infractions'] });
      toast.success('Auto de infracção criado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'auto de infracção', error));
    },
  });
}

export function useUpdateInfraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'forest_infractions'> & { id: string }) => {
      const { data, error } = await supabase
        .from('forest_infractions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-infractions'] });
      toast.success('Auto actualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'auto de infracção', error));
    },
  });
}

// Complaints
export function useForestComplaints() {
  return useQuery({
    queryKey: ['forest-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_complaints')
        .select('*, provinces(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ForestComplaint[];
    },
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (complaint: TablesInsert<'forest_complaints'>) => {
      const { data, error } = await supabase
        .from('forest_complaints')
        .insert([complaint])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-complaints'] });
      toast.success('Denúncia registada com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'denúncia', error));
    },
  });
}

// Nurseries
export function useForestNurseries() {
  return useQuery({
    queryKey: ['forest-nurseries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_nurseries')
        .select('*, provinces(name)')
        .order('name');
      if (error) throw error;
      return data as ForestNursery[];
    },
  });
}

export function useCreateNursery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nursery: TablesInsert<'forest_nurseries'>) => {
      const { data, error } = await supabase
        .from('forest_nurseries')
        .insert([nursery])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-nurseries'] });
      toast.success('Viveiro criado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'viveiro', error));
    },
  });
}

// Reforestation Programs
export function useReforestationPrograms() {
  return useQuery({
    queryKey: ['forest-reforestation-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_reforestation_programs')
        .select('*, provinces(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ForestReforestationProgram[];
    },
  });
}

export function useCreateReforestationProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (program: TablesInsert<'forest_reforestation_programs'>) => {
      const { data, error } = await supabase
        .from('forest_reforestation_programs')
        .insert([program])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-reforestation-programs'] });
      toast.success('Programa de reflorestamento criado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'programa de reflorestamento', error));
    },
  });
}

// Dashboard Stats
export function useForestryStats() {
  return useQuery({
    queryKey: ['forestry-stats'],
    queryFn: async () => {
      const [licenses, infractions, complaints, transport, nurseries, programs] = await Promise.all([
        supabase.from('forest_licenses').select('id, status, authorized_volume_m3, harvested_volume_m3', { count: 'exact' }),
        supabase.from('forest_infractions').select('id, status, severity', { count: 'exact' }),
        supabase.from('forest_complaints').select('id, status', { count: 'exact' }),
        supabase.from('forest_transport_permits').select('id, status', { count: 'exact' }),
        supabase.from('forest_nurseries').select('id, current_stock', { count: 'exact' }),
        supabase.from('forest_reforestation_programs').select('id, planted_area_ha, planted_seedlings', { count: 'exact' }),
      ]);

      const activeLicenses = licenses.data?.filter(l => ['active', 'approved'].includes(l.status)).length || 0;
      const totalAuthorizedVolume = licenses.data?.reduce((sum, l) => sum + (l.authorized_volume_m3 || 0), 0) || 0;
      const pendingInfractions = infractions.data?.filter(i => !['closed', 'archived'].includes(i.status)).length || 0;
      const pendingComplaints = complaints.data?.filter(c => c.status === 'pending').length || 0;
      const activeTransports = transport.data?.filter(t => t.status === 'active').length || 0;
      const totalNurseryStock = nurseries.data?.reduce((sum, n) => sum + (n.current_stock || 0), 0) || 0;
      const totalReforestedArea = programs.data?.reduce((sum, p) => sum + (p.planted_area_ha || 0), 0) || 0;

      return {
        activeLicenses,
        totalAuthorizedVolume,
        pendingInfractions,
        pendingComplaints,
        activeTransports,
        totalNurseryStock,
        totalReforestedArea,
        totalLicenses: licenses.count || 0,
        totalInfractions: infractions.count || 0,
        totalComplaints: complaints.count || 0,
      };
    },
  });
}
