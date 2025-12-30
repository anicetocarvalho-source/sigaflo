import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WorkflowStatus } from './useFarmers';

export type CertificateType = 'production' | 'organic' | 'quality' | 'origin' | 'good_practices';

export interface Certificate {
  id: string;
  farmer_id: string;
  production_history_id?: string;
  certificate_number: string;
  certificate_type: CertificateType;
  crops: string[];
  total_area_ha?: number;
  total_quantity_kg?: number;
  season: string;
  year: number;
  issue_date?: string;
  expiry_date?: string;
  status: WorkflowStatus;
  submitted_at?: string;
  submitted_by?: string;
  validated_at?: string;
  validated_by?: string;
  validation_notes?: string;
  approved_at?: string;
  approved_by?: string;
  approval_notes?: string;
  issued_at?: string;
  issued_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  qr_code_data?: string;
  verification_url?: string;
  created_at: string;
  updated_at: string;
  farmers?: {
    name: string;
    registration_number: string;
    farmer_type: string;
    provinces?: { name: string };
  };
}

export interface ProductionHistory {
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
}

export const useCertificates = (filters?: {
  status?: WorkflowStatus;
  year?: number;
  farmer_id?: string;
}) => {
  return useQuery({
    queryKey: ['certificates', filters],
    queryFn: async () => {
      let query = supabase
        .from('agricultural_certificates')
        .select(`
          *,
          farmers(name, registration_number, farmer_type, provinces(name))
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.farmer_id) {
        query = query.eq('farmer_id', filters.farmer_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Certificate[];
    },
  });
};

export const useCertificate = (id: string) => {
  return useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agricultural_certificates')
        .select(`
          *,
          farmers(name, registration_number, farmer_type, provinces(name), municipalities(name))
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Certificate | null;
    },
    enabled: !!id,
  });
};

export const useCertificateByNumber = (certificateNumber: string) => {
  return useQuery({
    queryKey: ['certificate-number', certificateNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agricultural_certificates')
        .select(`
          *,
          farmers(name, registration_number, farmer_type, provinces(name), municipalities(name))
        `)
        .eq('certificate_number', certificateNumber)
        .maybeSingle();
      if (error) throw error;
      return data as Certificate | null;
    },
    enabled: !!certificateNumber,
  });
};

export const useProductionHistory = (farmerId?: string) => {
  return useQuery({
    queryKey: ['production-history', farmerId],
    queryFn: async () => {
      let query = supabase
        .from('production_history')
        .select('*')
        .order('year', { ascending: false });
      
      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductionHistory[];
    },
    enabled: !!farmerId,
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (certificate: Omit<Partial<Certificate>, 'id' | 'created_at' | 'updated_at' | 'certificate_number' | 'farmers'>) => {
      const { data, error } = await supabase
        .from('agricultural_certificates')
        .insert(certificate as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificado criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar certificado: ' + error.message);
    },
  });
};

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...certificate }: Partial<Certificate> & { id: string }) => {
      const { data, error } = await supabase
        .from('agricultural_certificates')
        .update(certificate)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['certificate', variables.id] });
      toast.success('Certificado atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar certificado: ' + error.message);
    },
  });
};

export const useUpdateCertificateStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: WorkflowStatus; 
      notes?: string;
    }) => {
      const updates: Partial<Certificate> = { status };
      const now = new Date().toISOString();
      
      switch (status) {
        case 'submitted':
          updates.submitted_at = now;
          break;
        case 'validated':
          updates.validated_at = now;
          updates.validation_notes = notes;
          break;
        case 'approved':
          updates.approved_at = now;
          updates.approval_notes = notes;
          break;
        case 'issued':
          updates.issued_at = now;
          updates.issue_date = now.split('T')[0];
          break;
        case 'rejected':
          updates.rejected_at = now;
          updates.rejection_reason = notes;
          break;
      }
      
      const { data, error } = await supabase
        .from('agricultural_certificates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['certificate', variables.id] });
      toast.success('Estado atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar estado: ' + error.message);
    },
  });
};

export const useCreateProductionHistory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (production: Omit<Partial<ProductionHistory>, 'id' | 'created_at' | 'updated_at' | 'yield_per_ha'>) => {
      const { data, error } = await supabase
        .from('production_history')
        .insert(production as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production-history', variables.farmer_id] });
      toast.success('Histórico de produção adicionado');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar produção: ' + error.message);
    },
  });
};

export const useCertificateStats = () => {
  return useQuery({
    queryKey: ['certificate-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agricultural_certificates')
        .select('status, certificate_type, year');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        byYear: {} as Record<number, number>,
      };
      
      data.forEach((cert: any) => {
        stats.byStatus[cert.status] = (stats.byStatus[cert.status] || 0) + 1;
        stats.byType[cert.certificate_type] = (stats.byType[cert.certificate_type] || 0) + 1;
        stats.byYear[cert.year] = (stats.byYear[cert.year] || 0) + 1;
      });
      
      return stats;
    },
  });
};
