import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Dataset {
  id: string;
  code: string;
  name: string;
  description: string | null;
  source_table: string;
  data_category: string;
  sensitivity_level: string;
  available_fields: string[];
  restricted_fields: string[];
  aggregation_required: boolean;
  min_aggregation_level: string | null;
  is_active: boolean;
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  organization_type: string;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  agreement_reference: string | null;
  agreement_start_date: string | null;
  agreement_end_date: string | null;
  max_concurrent_users: number;
  allowed_datasets: string[];
  is_active: boolean;
}

export interface Researcher {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  research_area: string | null;
  access_level: string;
  allowed_datasets: string[];
  max_exports_per_month: number;
  exports_this_month: number;
  is_active: boolean;
  approved_at: string | null;
  expires_at: string | null;
  organization?: Organization;
}

export interface AccessRequest {
  id: string;
  request_number: string;
  researcher_id: string | null;
  organization_id: string | null;
  dataset_ids: string[];
  purpose: string;
  research_description: string | null;
  expected_duration_days: number;
  requested_fields: string[] | null;
  geographic_scope: string[] | null;
  temporal_scope_start: string | null;
  temporal_scope_end: string | null;
  output_format: string;
  status: string;
  reviewed_at: string | null;
  review_notes: string | null;
  approved_until: string | null;
  created_at: string;
  researcher?: Researcher;
  organization?: Organization;
}

export interface SavedQuery {
  id: string;
  researcher_id: string | null;
  name: string;
  description: string | null;
  dataset_id: string | null;
  query_config: Record<string, unknown>;
  is_template: boolean;
  is_public: boolean;
  execution_count: number;
  last_executed_at: string | null;
}

export interface QueryHistory {
  id: string;
  researcher_id: string | null;
  saved_query_id: string | null;
  dataset_id: string | null;
  query_config: Record<string, unknown>;
  execution_time_ms: number | null;
  rows_returned: number | null;
  was_exported: boolean;
  export_format: string | null;
  executed_at: string;
  dataset?: Dataset;
}

export interface DataExport {
  id: string;
  researcher_id: string | null;
  dataset_ids: string[] | null;
  export_format: string;
  row_count: number | null;
  file_size_bytes: number | null;
  purpose: string | null;
  downloaded_at: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  researcher_id: string | null;
  organization_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  researcher?: Researcher;
  organization?: Organization;
}

export interface DataLabStats {
  total_datasets: number;
  total_organizations: number;
  total_researchers: number;
  active_researchers: number;
  pending_requests: number;
  total_queries_today: number;
  total_exports_today: number;
  active_sessions: number;
}

// Datasets
export function useDatasets() {
  return useQuery({
    queryKey: ['data-lab-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_lab_datasets')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Dataset[];
    },
  });
}

// Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ['data-lab-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_lab_organizations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Organization[];
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (org: Partial<Organization>) => {
      const { data, error } = await supabase
        .from('data_lab_organizations')
        .insert(org as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-lab-organizations'] });
      toast.success('Organização criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar organização: ${error.message}`);
    },
  });
}

// Researchers
export function useResearchers() {
  return useQuery({
    queryKey: ['data-lab-researchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_lab_researchers')
        .select(`
          *,
          organization:data_lab_organizations(*)
        `)
        .order('full_name');
      if (error) throw error;
      return data as Researcher[];
    },
  });
}

export function useCreateResearcher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (researcher: Partial<Researcher>) => {
      const { data, error } = await supabase
        .from('data_lab_researchers')
        .insert(researcher as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-lab-researchers'] });
      toast.success('Investigador registado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registar investigador: ${error.message}`);
    },
  });
}

// Access Requests
export function useAccessRequests() {
  return useQuery({
    queryKey: ['data-lab-access-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_lab_access_requests')
        .select(`
          *,
          researcher:data_lab_researchers(*),
          organization:data_lab_organizations(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AccessRequest[];
    },
  });
}

export function useUpdateAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AccessRequest>) => {
      const { data, error } = await supabase
        .from('data_lab_access_requests')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-lab-access-requests'] });
      toast.success('Pedido actualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao actualizar pedido: ${error.message}`);
    },
  });
}

// Query History
export function useQueryHistory() {
  return useQuery({
    queryKey: ['data-lab-query-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_lab_query_history')
        .select(`
          *,
          dataset:data_lab_datasets(*)
        `)
        .order('executed_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as QueryHistory[];
    },
  });
}

// Exports
export function useDataExports() {
  return useQuery({
    queryKey: ['data-lab-exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_lab_exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as DataExport[];
    },
  });
}

// Audit Log
export function useAuditLog(filters?: { action?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['data-lab-audit-log', filters],
    queryFn: async () => {
      let query = supabase
        .from('data_lab_audit_log')
        .select(`
          *,
          researcher:data_lab_researchers(full_name, email),
          organization:data_lab_organizations(name)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AuditLogEntry[];
    },
  });
}

// Stats
export function useDataLabStats() {
  return useQuery({
    queryKey: ['data-lab-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [datasets, organizations, researchers, requests, queries, exports] = await Promise.all([
        supabase.from('data_lab_datasets').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('data_lab_organizations').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('data_lab_researchers').select('id, is_active', { count: 'exact' }),
        supabase.from('data_lab_access_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('data_lab_query_history').select('id', { count: 'exact' }).gte('executed_at', today),
        supabase.from('data_lab_exports').select('id', { count: 'exact' }).gte('created_at', today),
      ]);

      const activeResearchers = (researchers.data || []).filter((r: any) => r.is_active).length;

      return {
        total_datasets: datasets.count || 0,
        total_organizations: organizations.count || 0,
        total_researchers: researchers.count || 0,
        active_researchers: activeResearchers,
        pending_requests: requests.count || 0,
        total_queries_today: queries.count || 0,
        total_exports_today: exports.count || 0,
        active_sessions: 0, // TODO: implement real session tracking
      } as DataLabStats;
    },
  });
}

// Log audit action
export async function logAuditAction(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>
) {
  const { error } = await supabase.from('data_lab_audit_log').insert({
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
  } as any);
  if (error) console.error('Audit log error:', error);
}
