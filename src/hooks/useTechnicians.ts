import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FieldTechnician {
  id: string;
  employee_number: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  specialization: string;
  province_id: string | null;
  municipality_id: string | null;
  status: string;
  max_farmers: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  provinces?: { name: string } | null;
  municipalities?: { name: string } | null;
  assigned_farmers_count?: number;
}

export function useTechnicians() {
  const queryClient = useQueryClient();

  const techniciansQuery = useQuery({
    queryKey: ['field_technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('field_technicians')
        .select('*, provinces(name), municipalities(name)')
        .order('full_name');
      if (error) throw error;

      // Get farmer counts per technician
      const { data: farmerCounts, error: countError } = await supabase
        .from('farmers')
        .select('technician_id')
        .not('technician_id', 'is', null);

      const countMap: Record<string, number> = {};
      if (!countError && farmerCounts) {
        farmerCounts.forEach((f: any) => {
          countMap[f.technician_id] = (countMap[f.technician_id] || 0) + 1;
        });
      }

      return (data || []).map((t: any) => ({
        ...t,
        assigned_farmers_count: countMap[t.id] || 0,
      })) as FieldTechnician[];
    },
  });

  const createTechnician = useMutation({
    mutationFn: async (data: Partial<FieldTechnician>) => {
      const { data: result, error } = await supabase
        .from('field_technicians')
        .insert({
          full_name: data.full_name!,
          phone: data.phone,
          email: data.email,
          specialization: data.specialization || 'general',
          province_id: data.province_id,
          municipality_id: data.municipality_id,
          max_farmers: data.max_farmers || 150,
          notes: data.notes,
          employee_number: '',
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field_technicians'] });
      toast.success('Técnico registado com sucesso');
    },
    onError: () => toast.error('Erro ao registar técnico'),
  });

  const updateTechnician = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FieldTechnician> & { id: string }) => {
      const { error } = await supabase
        .from('field_technicians')
        .update(data as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field_technicians'] });
      toast.success('Técnico actualizado');
    },
    onError: () => toast.error('Erro ao actualizar técnico'),
  });

  const deleteTechnician = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('field_technicians').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field_technicians'] });
      toast.success('Técnico removido');
    },
    onError: () => toast.error('Erro ao remover técnico'),
  });

  const assignFarmers = useMutation({
    mutationFn: async ({ technicianId, farmerIds }: { technicianId: string; farmerIds: string[] }) => {
      const { error } = await supabase
        .from('farmers')
        .update({ technician_id: technicianId } as any)
        .in('id', farmerIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field_technicians'] });
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast.success('Agricultores atribuídos com sucesso');
    },
    onError: () => toast.error('Erro ao atribuir agricultores'),
  });

  const unassignFarmers = useMutation({
    mutationFn: async (farmerIds: string[]) => {
      const { error } = await supabase
        .from('farmers')
        .update({ technician_id: null } as any)
        .in('id', farmerIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field_technicians'] });
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast.success('Agricultores desvinculados');
    },
    onError: () => toast.error('Erro ao desvincular agricultores'),
  });

  const useTechnicianFarmers = (technicianId: string | null) =>
    useQuery({
      queryKey: ['technician_farmers', technicianId],
      enabled: !!technicianId,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('farmers')
          .select('id, name, registration_number, farmer_type, province_id, municipality_id, provinces(name), municipalities(name)')
          .eq('technician_id', technicianId!)
          .order('name');
        if (error) throw error;
        return data || [];
      },
    });

  return {
    technicians: techniciansQuery.data || [],
    isLoading: techniciansQuery.isLoading,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    assignFarmers,
    unassignFarmers,
    useTechnicianFarmers,
  };
}
