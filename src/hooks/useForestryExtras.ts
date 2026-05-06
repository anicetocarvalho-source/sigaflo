// SIGAFLO Forestry — extended hooks for Management Plans, Payments (AGT),
// Certificates, Occurrences, Companion Devices, NFC Cards, Field Captures.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';

// ---------- Forest Management Plans (EUDR) ----------
export function useForestManagementPlans() {
  return useQuery({
    queryKey: ['forest-management-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_management_plans' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}
export function useUpsertManagementPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('forest_management_plans' as any)
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-management-plans'] });
      toast.success('Plano de maneio guardado');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'plano de maneio', e)),
  });
}

// ---------- Payments (AGT + 10% RL) ----------
export function useForestPayments() {
  return useQuery({
    queryKey: ['forest-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_payment_transactions' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}
export function useChargeAGT() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      reference_type: 'license' | 'permit' | 'other';
      reference_id?: string;
      operator_id?: string;
      base_amount_aoa: number;
      province_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('agt-payment', { body: payload });
      if (error) throw error;
      if (!data?.success) throw new Error('Pagamento AGT recusado');
      return data.transaction;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-payments'] });
      qc.invalidateQueries({ queryKey: ['forest-licenses'] });
      toast.success('Pagamento AGT processado (com surcharge 10% RL)');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Erro no pagamento AGT'),
  });
}

// ---------- Forest Certificates (Selo Verde) ----------
export function useForestCertificates() {
  return useQuery({
    queryKey: ['forest-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_certificates' as any)
        .select('*')
        .order('issue_date', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}
export function useUpsertForestCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('forest_certificates' as any)
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-certificates'] });
      toast.success('Certificado verde emitido');
    },
    onError: (e) => toast.error(getCrudErrorMessage('create', 'certificado verde', e)),
  });
}

// ---------- Forest Occurrences (incêndios, pragas) ----------
export function useForestOccurrences(filter?: { type?: string }) {
  return useQuery({
    queryKey: ['forest-occurrences', filter],
    queryFn: async () => {
      let q = supabase.from('forest_occurrences' as any).select('*').order('reported_at', { ascending: false });
      if (filter?.type) q = q.eq('occurrence_type', filter.type);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}
export function useCreateForestOccurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('forest_occurrences' as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forest-occurrences'] });
      toast.success('Ocorrência registada');
    },
    onError: (e) => toast.error(getCrudErrorMessage('create', 'ocorrência florestal', e)),
  });
}

// ---------- Companion Devices ----------
export function useCompanionDevices() {
  return useQuery({
    queryKey: ['companion-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companion_devices' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

// ---------- NFC Cards ----------
export function useOperatorNFCCards() {
  return useQuery({
    queryKey: ['operator-nfc-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_nfc_cards' as any)
        .select('*, forest_operators(name, nif)')
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}
export function useUpsertNFCCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('operator_nfc_cards' as any)
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operator-nfc-cards'] });
      toast.success('Cartão NFC guardado');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'cartão NFC', e)),
  });
}

// ---------- Field Captures (audit) ----------
export function useFieldCaptures() {
  return useQuery({
    queryKey: ['field-captures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('field_captures' as any)
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as any[];
    },
  });
}
