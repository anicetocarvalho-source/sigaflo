import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInsurance() {
  const queryClient = useQueryClient();

  const quotesQuery = useQuery({
    queryKey: ['insurance_quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_quotes')
        .select('*, farmers(name, registration_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const policiesQuery = useQuery({
    queryKey: ['insurance_policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*, farmers(name, registration_number), provinces(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const claimsQuery = useQuery({
    queryKey: ['insurance_claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*, farmers(name, registration_number), insurance_policies(policy_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const rulesQuery = useQuery({
    queryKey: ['parametric_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parametric_rules')
        .select('*, provinces(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createQuote = useMutation({
    mutationFn: async (quote: any) => {
      const { data, error } = await supabase.from('insurance_quotes').insert({ ...quote, quote_number: '' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurance_quotes'] }); toast.success('Cotação criada'); },
    onError: () => toast.error('Erro ao criar cotação'),
  });

  const createPolicy = useMutation({
    mutationFn: async (policy: any) => {
      const { data, error } = await supabase.from('insurance_policies').insert({ ...policy, policy_number: '' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurance_policies'] }); toast.success('Apólice criada'); },
    onError: () => toast.error('Erro ao criar apólice'),
  });

  const createClaim = useMutation({
    mutationFn: async (claim: any) => {
      const { data, error } = await supabase.from('insurance_claims').insert({ ...claim, claim_number: '' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurance_claims'] }); toast.success('Sinistro registado'); },
    onError: () => toast.error('Erro ao registar sinistro'),
  });

  const updateClaim = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('insurance_claims').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurance_claims'] }); toast.success('Sinistro actualizado'); },
    onError: () => toast.error('Erro ao actualizar sinistro'),
  });

  const createRule = useMutation({
    mutationFn: async (rule: any) => {
      const { data, error } = await supabase.from('parametric_rules').insert(rule).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['parametric_rules'] }); toast.success('Regra criada'); },
    onError: () => toast.error('Erro ao criar regra'),
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('parametric_rules').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['parametric_rules'] }); toast.success('Regra actualizada'); },
    onError: () => toast.error('Erro ao actualizar regra'),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('parametric_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['parametric_rules'] }); toast.success('Regra eliminada'); },
    onError: () => toast.error('Erro ao eliminar regra'),
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value);

  const stats = {
    totalPolicies: policiesQuery.data?.length || 0,
    activePolicies: policiesQuery.data?.filter((p: any) => p.status === 'active').length || 0,
    totalClaims: claimsQuery.data?.length || 0,
    pendingClaims: claimsQuery.data?.filter((c: any) => c.status === 'submitted' || c.status === 'under_review').length || 0,
    totalInsuredAoa: policiesQuery.data?.filter((p: any) => p.status === 'active').reduce((s: number, p: any) => s + Number(p.sum_insured_aoa || 0), 0) || 0,
    totalPremiumAoa: policiesQuery.data?.filter((p: any) => p.status === 'active').reduce((s: number, p: any) => s + Number(p.premium_aoa || 0), 0) || 0,
    totalApprovedAoa: claimsQuery.data?.reduce((s: number, c: any) => s + Number(c.approved_amount_aoa || 0), 0) || 0,
    activeRules: rulesQuery.data?.filter((r: any) => r.is_active).length || 0,
  };

  return {
    quotes: quotesQuery.data || [], quotesLoading: quotesQuery.isLoading,
    policies: policiesQuery.data || [], policiesLoading: policiesQuery.isLoading,
    claims: claimsQuery.data || [], claimsLoading: claimsQuery.isLoading,
    rules: rulesQuery.data || [], rulesLoading: rulesQuery.isLoading,
    createQuote, createPolicy, createClaim, updateClaim, createRule, updateRule, deleteRule,
    stats, formatCurrency,
  };
}
