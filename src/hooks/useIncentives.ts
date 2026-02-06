import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';

// Types
export interface IncentiveProgram {
  id: string;
  code: string;
  name: string;
  description: string | null;
  program_type: 'subsidy' | 'credit' | 'tax_benefit' | 'technical_support';
  sector: 'agriculture' | 'forestry' | 'coffee' | 'rice';
  budget_aoa: number | null;
  allocated_aoa: number;
  disbursed_aoa: number;
  start_date: string;
  end_date: string | null;
  status: 'draft' | 'active' | 'suspended' | 'completed' | 'cancelled';
  target_beneficiaries: number | null;
  actual_beneficiaries: number;
  target_provinces: string[] | null;
  created_at: string;
}

export interface EligibilityRule {
  id: string;
  program_id: string;
  rule_name: string;
  rule_type: string;
  operator: string;
  value: string;
  is_mandatory: boolean;
  weight: number;
}

export interface IncentiveAllocation {
  id: string;
  program_id: string;
  farmer_id: string;
  allocation_date: string;
  amount_aoa: number;
  status: 'pending' | 'approved' | 'disbursed' | 'cancelled' | 'returned';
  eligibility_score: number | null;
  eligibility_details: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  program?: IncentiveProgram;
  farmer?: { id: string; name: string; farmer_type: string };
}

export interface IncentiveImpact {
  id: string;
  allocation_id: string;
  evaluation_date: string;
  evaluation_type: string;
  production_before_kg: number | null;
  production_after_kg: number | null;
  production_change_pct: number | null;
  area_before_ha: number | null;
  area_after_ha: number | null;
  area_change_pct: number | null;
  income_before_aoa: number | null;
  income_after_aoa: number | null;
  income_change_pct: number | null;
  jobs_created: number;
  compliance_score: number | null;
  notes: string | null;
}

export interface IncentiveAlert {
  id: string;
  program_id: string | null;
  allocation_id: string | null;
  alert_type: 'no_impact' | 'deviation' | 'expiring' | 'budget_exceeded' | 'compliance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
}

export interface SimulationResult {
  eligibleFarmers: number;
  totalBudgetNeeded: number;
  averagePerFarmer: number;
  provinceDistribution: { province: string; count: number; amount: number }[];
  sectorImpact: { sector: string; estimatedIncrease: number }[];
  riskFactors: { factor: string; level: 'low' | 'medium' | 'high' }[];
}

// Programs
export function useIncentivePrograms(status?: string) {
  return useQuery({
    queryKey: ['incentive-programs', status],
    queryFn: async () => {
      let query = supabase
        .from('incentive_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncentiveProgram[];
    },
  });
}

export function useIncentiveProgram(id: string) {
  return useQuery({
    queryKey: ['incentive-program', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incentive_programs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as IncentiveProgram;
    },
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: Partial<IncentiveProgram>) => {
      const { data, error } = await supabase
        .from('incentive_programs')
        .insert(program as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-programs'] });
      toast.success('Programa criado com sucesso');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('create', 'programa', error));
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IncentiveProgram> & { id: string }) => {
      const { data, error } = await supabase
        .from('incentive_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-programs'] });
      toast.success('Programa atualizado');
    },
    onError: (error) => {
      toast.error(getCrudErrorMessage('update', 'programa', error));
    },
  });
}

// Eligibility Rules
export function useEligibilityRules(programId: string) {
  return useQuery({
    queryKey: ['eligibility-rules', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eligibility_rules')
        .select('*')
        .eq('program_id', programId)
        .order('created_at');

      if (error) throw error;
      return data as EligibilityRule[];
    },
    enabled: !!programId,
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<EligibilityRule>) => {
      const { data, error } = await supabase
        .from('eligibility_rules')
        .insert(rule as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules', variables.program_id] });
      toast.success('Regra adicionada');
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, programId }: { id: string; programId: string }) => {
      const { error } = await supabase
        .from('eligibility_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return programId;
    },
    onSuccess: (programId) => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules', programId] });
      toast.success('Regra removida');
    },
  });
}

// Allocations
export function useAllocations(programId?: string, status?: string) {
  return useQuery({
    queryKey: ['incentive-allocations', programId, status],
    queryFn: async () => {
      let query = supabase
        .from('incentive_allocations')
        .select(`
          *,
          program:incentive_programs(id, name, code),
          farmer:farmers(id, name, farmer_type)
        `)
        .order('created_at', { ascending: false });

      if (programId) {
        query = query.eq('program_id', programId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as IncentiveAllocation[];
    },
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (allocation: Partial<IncentiveAllocation>) => {
      const { data, error } = await supabase
        .from('incentive_allocations')
        .insert(allocation as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['incentive-programs'] });
      toast.success('Alocação criada');
    },
  });
}

export function useUpdateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IncentiveAllocation> & { id: string }) => {
      const { data, error } = await supabase
        .from('incentive_allocations')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-allocations'] });
      toast.success('Alocação atualizada');
    },
  });
}

// Impacts
export function useImpacts(allocationId?: string) {
  return useQuery({
    queryKey: ['incentive-impacts', allocationId],
    queryFn: async () => {
      let query = supabase
        .from('incentive_impacts')
        .select('*')
        .order('evaluation_date', { ascending: false });

      if (allocationId) {
        query = query.eq('allocation_id', allocationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncentiveImpact[];
    },
  });
}

export function useCreateImpact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (impact: Partial<IncentiveImpact>) => {
      const { data, error } = await supabase
        .from('incentive_impacts')
        .insert(impact as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-impacts'] });
      toast.success('Avaliação de impacto registada');
    },
  });
}

// Alerts
export function useIncentiveAlerts(resolved?: boolean) {
  return useQuery({
    queryKey: ['incentive-alerts', resolved],
    queryFn: async () => {
      let query = supabase
        .from('incentive_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (resolved !== undefined) {
        query = query.eq('is_resolved', resolved);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncentiveAlert[];
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('incentive_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-alerts'] });
      toast.success('Alerta resolvido');
    },
  });
}

// Stats
export function useIncentiveStats() {
  return useQuery({
    queryKey: ['incentive-stats'],
    queryFn: async () => {
      const [programsRes, allocationsRes, alertsRes] = await Promise.all([
        supabase.from('incentive_programs').select('status, budget_aoa, allocated_aoa, disbursed_aoa'),
        supabase.from('incentive_allocations').select('status, amount_aoa'),
        supabase.from('incentive_alerts').select('is_resolved, severity'),
      ]);

      const programs = programsRes.data || [];
      const allocations = allocationsRes.data || [];
      const alerts = alertsRes.data || [];

      const activePrograms = programs.filter(p => p.status === 'active').length;
      const totalBudget = programs.reduce((sum, p) => sum + (p.budget_aoa || 0), 0);
      const totalAllocated = programs.reduce((sum, p) => sum + (p.allocated_aoa || 0), 0);
      const totalDisbursed = programs.reduce((sum, p) => sum + (p.disbursed_aoa || 0), 0);
      
      const pendingAllocations = allocations.filter(a => a.status === 'pending').length;
      const totalBeneficiaries = allocations.filter(a => a.status === 'disbursed').length;
      
      const unresolvedAlerts = alerts.filter(a => !a.is_resolved).length;
      const criticalAlerts = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length;

      return {
        activePrograms,
        totalBudget,
        totalAllocated,
        totalDisbursed,
        executionRate: totalBudget > 0 ? (totalDisbursed / totalBudget) * 100 : 0,
        pendingAllocations,
        totalBeneficiaries,
        unresolvedAlerts,
        criticalAlerts,
      };
    },
  });
}

// Simulation helpers
export async function simulateEligibility(
  programId: string,
  rules: EligibilityRule[]
): Promise<SimulationResult> {
  // Fetch farmers to evaluate
  const { data: farmers } = await supabase
    .from('farmers')
    .select(`
      *,
      province:provinces(id, name),
      production:production_history(actual_yield_kg, area_planted_ha)
    `)
    .eq('is_active', true);

  if (!farmers) {
    return {
      eligibleFarmers: 0,
      totalBudgetNeeded: 0,
      averagePerFarmer: 0,
      provinceDistribution: [],
      sectorImpact: [],
      riskFactors: [],
    };
  }

  // Evaluate each farmer against rules
  const eligibleFarmers = farmers.filter(farmer => {
    let score = 0;
    let mandatoryPassed = true;

    for (const rule of rules) {
      const passed = evaluateRule(farmer, rule);
      
      if (rule.is_mandatory && !passed) {
        mandatoryPassed = false;
        break;
      }
      
      if (passed) {
        score += rule.weight;
      }
    }

    return mandatoryPassed && score > 0;
  });

  // Calculate distribution
  const provinceMap = new Map<string, { count: number; amount: number }>();
  eligibleFarmers.forEach(f => {
    const prov = (f.province as { name: string })?.name || 'Desconhecido';
    const current = provinceMap.get(prov) || { count: 0, amount: 0 };
    provinceMap.set(prov, {
      count: current.count + 1,
      amount: current.amount + 50000, // Estimated average
    });
  });

  return {
    eligibleFarmers: eligibleFarmers.length,
    totalBudgetNeeded: eligibleFarmers.length * 50000,
    averagePerFarmer: 50000,
    provinceDistribution: Array.from(provinceMap.entries()).map(([province, data]) => ({
      province,
      ...data,
    })),
    sectorImpact: [
      { sector: 'Produção', estimatedIncrease: 15 },
      { sector: 'Emprego', estimatedIncrease: 8 },
      { sector: 'Exportação', estimatedIncrease: 5 },
    ],
    riskFactors: [
      { factor: 'Verificação de elegibilidade', level: rules.length < 3 ? 'high' : 'low' },
      { factor: 'Capacidade de execução', level: eligibleFarmers.length > 1000 ? 'high' : 'medium' },
      { factor: 'Monitorização', level: 'medium' },
    ],
  };
}

function evaluateRule(farmer: Record<string, unknown>, rule: EligibilityRule): boolean {
  const { rule_type, operator, value } = rule;

  switch (rule_type) {
    case 'farmer_type':
      return compareValue(farmer.farmer_type as string, operator, value);
    case 'province':
      return compareValue((farmer.province as { id: string })?.id, operator, value);
    case 'area_min':
      return compareValue(farmer.total_area_ha as number, operator, parseFloat(value));
    case 'area_max':
      return compareValue(farmer.total_area_ha as number, operator, parseFloat(value));
    case 'crop_type':
      const crops = farmer.main_crops as string[] || [];
      return crops.includes(value);
    default:
      return true;
  }
}

function compareValue(actual: unknown, operator: string, expected: unknown): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'greater_than':
      return (actual as number) > (expected as number);
    case 'less_than':
      return (actual as number) < (expected as number);
    case 'contains':
      return String(actual).includes(String(expected));
    default:
      return false;
  }
}
