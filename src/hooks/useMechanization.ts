import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MechanizationCenter {
  id: string;
  name: string;
  center_type: string;
  province_id: string | null;
  municipality_id: string | null;
  commune_id: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  total_machines: number;
  operational_machines: number;
  manager_name: string | null;
  manager_phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  center_id: string | null;
  farmer_id: string | null;
  service_type: string;
  area_ha: number | null;
  machine_name: string | null;
  operator_name: string | null;
  status: string;
  requested_date: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  validated_at: string | null;
  cost_aoa: number;
  payment_method: string;
  payment_status: string;
  province_id: string | null;
  municipality_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  center_name?: string;
  farmer_name?: string;
}

export interface MechanizationValidation {
  id: string;
  service_order_id: string;
  worked_polygon: any;
  calculated_area_ha: number | null;
  declared_area_ha: number | null;
  area_deviation_pct: number | null;
  validation_method: string;
  validation_status: string;
  validated_by: string | null;
  validation_notes: string | null;
  satellite_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const SERVICE_TYPES = [
  { value: 'ploughing', label: 'Lavragem' },
  { value: 'harrowing', label: 'Gradagem' },
  { value: 'seeding', label: 'Sementeira' },
  { value: 'harvesting', label: 'Colheita' },
  { value: 'transport', label: 'Transporte' },
];

export const ORDER_STATUSES = [
  { value: 'requested', label: 'Solicitada', color: 'bg-blue-100 text-blue-800' },
  { value: 'scheduled', label: 'Agendada', color: 'bg-purple-100 text-purple-800' },
  { value: 'in_progress', label: 'Em Curso', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Concluída', color: 'bg-green-100 text-green-800' },
  { value: 'validated', label: 'Validada', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
];

export const CENTER_TYPES = [
  { value: 'tractor_center', label: 'Centro de Tractores' },
  { value: 'mobile_unit', label: 'Unidade Móvel' },
  { value: 'cooperative_fleet', label: 'Frota Cooperativa' },
];

export function useMechanizationCenters() {
  return useQuery({
    queryKey: ['mechanization-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mechanization_centers')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []) as MechanizationCenter[];
    },
  });
}

export function useServiceOrders(filters?: { status?: string; centerId?: string }) {
  return useQuery({
    queryKey: ['service-orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('service_orders')
        .select('*, mechanization_centers(name), farmers(name)')
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.centerId) query = query.eq('center_id', filters.centerId);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((o: any) => ({
        ...o,
        center_name: o.mechanization_centers?.name,
        farmer_name: o.farmers?.name,
      })) as ServiceOrder[];
    },
  });
}

export function useCreateCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (center: Partial<MechanizationCenter>) => {
      const { data, error } = await supabase
        .from('mechanization_centers')
        .insert(center as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mechanization-centers'] });
      toast({ title: 'Centro criado com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar centro', description: e.message || 'Verifique os dados e tente novamente', variant: 'destructive' }),
  });
}

export function useCreateServiceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: Partial<ServiceOrder>) => {
      const { data, error } = await supabase
        .from('service_orders')
        .insert({ ...order, order_number: '' } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-orders'] });
      toast({ title: 'Ordem de serviço criada' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar ordem de serviço', description: e.message || 'Verifique os dados e tente novamente', variant: 'destructive' }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'in_progress') updates.started_at = new Date().toISOString();
      if (status === 'completed') updates.completed_at = new Date().toISOString();
      if (status === 'validated') updates.validated_at = new Date().toISOString();

      const { error } = await supabase.from('service_orders').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-orders'] });
      toast({ title: 'Estado actualizado' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useMechanizationStats() {
  const { data: centers } = useMechanizationCenters();
  const { data: orders } = useServiceOrders();

  const totalCenters = centers?.length || 0;
  const activeCenters = centers?.filter(c => c.status === 'active').length || 0;
  const totalMachines = centers?.reduce((s, c) => s + (c.total_machines || 0), 0) || 0;
  const operationalMachines = centers?.reduce((s, c) => s + (c.operational_machines || 0), 0) || 0;

  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed' || o.status === 'validated').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'requested' || o.status === 'scheduled').length || 0;
  const inProgressOrders = orders?.filter(o => o.status === 'in_progress').length || 0;
  const totalAreaHa = orders?.reduce((s, o) => s + (o.area_ha || 0), 0) || 0;
  const totalRevenue = orders?.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.cost_aoa || 0), 0) || 0;

  return {
    totalCenters,
    activeCenters,
    totalMachines,
    operationalMachines,
    totalOrders,
    completedOrders,
    pendingOrders,
    inProgressOrders,
    totalAreaHa,
    totalRevenue,
  };
}
