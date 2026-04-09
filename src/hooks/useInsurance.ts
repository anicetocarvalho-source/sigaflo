import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInsurancePolicies() {
  return useQuery({
    queryKey: ['insurance-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*, farmers(name, registration_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useInsuranceQuotes() {
  return useQuery({
    queryKey: ['insurance-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_quotes')
        .select('*, farmers(name, registration_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useInsuranceClaims() {
  return useQuery({
    queryKey: ['insurance-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*, insurance_policies(policy_number, farmers(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useParametricRules() {
  return useQuery({
    queryKey: ['parametric-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parametric_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quote: any) => {
      const { data, error } = await supabase
        .from('insurance_quotes')
        .insert({ ...quote, quote_number: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insurance-quotes'] });
      toast.success('Cotação criada com sucesso');
    },
    onError: () => toast.error('Erro ao criar cotação'),
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (policy: any) => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert({ ...policy, policy_number: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insurance-policies'] });
      toast.success('Apólice criada com sucesso');
    },
    onError: () => toast.error('Erro ao criar apólice'),
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (claim: any) => {
      const { data, error } = await supabase
        .from('insurance_claims')
        .insert({ ...claim, claim_number: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insurance-claims'] });
      toast.success('Sinistro registado com sucesso');
    },
    onError: () => toast.error('Erro ao registar sinistro'),
  });
}

export function useUpdateClaimStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, payment_amount_aoa }: { id: string; status: string; payment_amount_aoa?: number }) => {
      const updates: any = { status };
      if (status === 'approved') updates.approved_at = new Date().toISOString();
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
        if (payment_amount_aoa) updates.payment_amount_aoa = payment_amount_aoa;
      }
      if (status === 'rejected') updates.rejected_at = new Date().toISOString();
      const { error } = await supabase.from('insurance_claims').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insurance-claims'] });
      toast.success('Estado do sinistro actualizado');
    },
    onError: () => toast.error('Erro ao actualizar sinistro'),
  });
}

export function useCreateParametricRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule: any) => {
      const { data, error } = await supabase
        .from('parametric_rules')
        .insert(rule)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parametric-rules'] });
      toast.success('Regra paramétrica criada');
    },
    onError: () => toast.error('Erro ao criar regra'),
  });
}

export function useInsuranceStats() {
  const { data: policies } = useInsurancePolicies();
  const { data: claims } = useInsuranceClaims();
  const { data: quotes } = useInsuranceQuotes();

  const activePolicies = policies?.filter((p: any) => p.status === 'active').length || 0;
  const totalInsuredValue = policies?.filter((p: any) => p.status === 'active').reduce((s: number, p: any) => s + (p.insured_value_aoa || 0), 0) || 0;
  const pendingClaims = claims?.filter((c: any) => c.status === 'pending' || c.status === 'under_review').length || 0;
  const totalClaimsPaid = claims?.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + (c.payment_amount_aoa || 0), 0) || 0;
  const pendingQuotes = quotes?.filter((q: any) => q.status === 'pending').length || 0;

  return { activePolicies, totalInsuredValue, pendingClaims, totalClaimsPaid, pendingQuotes };
}
