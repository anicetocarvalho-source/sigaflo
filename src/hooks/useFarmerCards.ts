import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCrudErrorMessage } from '@/lib/errorMessages';
import type { Farmer } from '@/hooks/useFarmers';

export type CardStatus = 'rascunho' | 'gerado' | 'impresso' | 'entregue' | 'revogado';
export type CardEventType = 'generated' | 'printed' | 'delivered' | 'revoked' | 'reissued' | 'qr_regenerated' | 'scanned';

export interface FarmerCard {
  id: string;
  farmer_id: string;
  serial: string;
  qr_token: string;
  card_status: CardStatus;
  version: number;
  snapshot: Record<string, unknown>;
  issued_at: string;
  printed_at?: string | null;
  delivered_at?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerCardEvent {
  id: string;
  card_id: string;
  event_type: CardEventType;
  actor_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const buildSnapshot = (farmer: Farmer) => ({
  name: farmer.name,
  registration_number: farmer.registration_number,
  farmer_type: farmer.farmer_type,
  province: farmer.provinces?.name,
  municipality: farmer.municipalities?.name,
  main_crops: farmer.main_crops,
  cultivated_area_ha: farmer.cultivated_area_ha,
  photo_url: farmer.photo_url,
  bi_nif: farmer.bi_nif,
  issued_at: new Date().toISOString(),
});

export const useActiveFarmerCard = (farmerId?: string) => {
  return useQuery({
    queryKey: ['farmer-card', 'active', farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const { data, error } = await supabase
        .from('farmer_cards' as any)
        .select('*')
        .eq('farmer_id', farmerId)
        .neq('card_status', 'revogado')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as FarmerCard | null;
    },
    enabled: !!farmerId,
  });
};

export const useFarmerCardHistory = (farmerId?: string) => {
  return useQuery({
    queryKey: ['farmer-card', 'history', farmerId],
    queryFn: async () => {
      if (!farmerId) return [];
      const { data, error } = await supabase
        .from('farmer_cards' as any)
        .select('*, events:farmer_card_events(*)')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (FarmerCard & { events: FarmerCardEvent[] })[];
    },
    enabled: !!farmerId,
  });
};

/** Tipos de entidade elegíveis para cartão SIGAFLO. */
export const CARD_ELIGIBLE_TYPES = ['individual', 'family', 'company'] as const;
export const isCardEligibleType = (t?: string) =>
  !!t && (CARD_ELIGIBLE_TYPES as readonly string[]).includes(t);

export const useGenerateCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (farmer: Farmer) => {
      if (!isCardEligibleType(farmer.farmer_type)) {
        throw new Error('Cooperativas e Escolas de Campo não são elegíveis para cartão SIGAFLO');
      }
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('farmer_cards' as any)
        .insert({
          farmer_id: farmer.id,
          card_status: 'gerado',
          snapshot: buildSnapshot(farmer),
          issued_by: userData.user?.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as FarmerCard;
    },
    onSuccess: (_d, farmer) => {
      qc.invalidateQueries({ queryKey: ['farmer-card', 'active', farmer.id] });
      qc.invalidateQueries({ queryKey: ['farmer-card', 'history', farmer.id] });
      qc.invalidateQueries({ queryKey: ['card-stats'] });
      toast.success('Cartão gerado com sucesso');
    },
    onError: (e) => toast.error(getCrudErrorMessage('create', 'cartão', e)),
  });
};

export const useUpdateCardStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, status, farmerId }: { cardId: string; status: CardStatus; farmerId: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const updates: Record<string, unknown> = { card_status: status };
      if (status === 'impresso') { updates.printed_at = new Date().toISOString(); updates.printed_by = userData.user?.id; }
      if (status === 'entregue') { updates.delivered_at = new Date().toISOString(); updates.delivered_by = userData.user?.id; }
      const { error } = await supabase.from('farmer_cards' as any).update(updates).eq('id', cardId);
      if (error) throw error;
      return { cardId, status, farmerId };
    },
    onSuccess: ({ farmerId }) => {
      qc.invalidateQueries({ queryKey: ['farmer-card', 'active', farmerId] });
      qc.invalidateQueries({ queryKey: ['farmer-card', 'history', farmerId] });
      qc.invalidateQueries({ queryKey: ['card-stats'] });
      toast.success('Estado do cartão atualizado');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'cartão', e)),
  });
};

export const useRevokeCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, reason, farmerId }: { cardId: string; reason: string; farmerId: string }) => {
      const { error } = await supabase.rpc('revoke_farmer_card' as any, { _card_id: cardId, _reason: reason });
      if (error) throw error;
      return { farmerId };
    },
    onSuccess: ({ farmerId }) => {
      qc.invalidateQueries({ queryKey: ['farmer-card', 'active', farmerId] });
      qc.invalidateQueries({ queryKey: ['farmer-card', 'history', farmerId] });
      qc.invalidateQueries({ queryKey: ['card-stats'] });
      toast.success('Cartão revogado');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'cartão', e)),
  });
};

export const useRegenerateQR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, farmerId }: { cardId: string; farmerId: string }) => {
      const { data, error } = await supabase.rpc('regenerate_card_qr' as any, { _card_id: cardId });
      if (error) throw error;
      return { token: data as string, farmerId };
    },
    onSuccess: ({ farmerId }) => {
      qc.invalidateQueries({ queryKey: ['farmer-card', 'active', farmerId] });
      qc.invalidateQueries({ queryKey: ['farmer-card', 'history', farmerId] });
      toast.success('QR regenerado — cartões físicos anteriores devem ser substituídos');
    },
    onError: (e) => toast.error(getCrudErrorMessage('update', 'cartão', e)),
  });
};

export const useCardStats = () => {
  return useQuery({
    queryKey: ['card-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_cards' as any)
        .select('card_status, farmer_id, farmers!inner(province_id, provinces(name))');
      if (error) throw error;
      const rows = (data ?? []) as any[];
      const stats = {
        total: rows.length,
        byStatus: { rascunho: 0, gerado: 0, impresso: 0, entregue: 0, revogado: 0 } as Record<CardStatus, number>,
        byProvince: {} as Record<string, number>,
      };
      rows.forEach((r) => {
        stats.byStatus[r.card_status as CardStatus] = (stats.byStatus[r.card_status as CardStatus] || 0) + 1;
        const pn = r.farmers?.provinces?.name;
        if (pn) stats.byProvince[pn] = (stats.byProvince[pn] || 0) + 1;
      });
      return stats;
    },
  });
};

import { qrTokenSchema, anyCardCodeSchema } from '@/lib/cardCodes';

export const useCardVerification = (token?: string) => {
  return useQuery({
    queryKey: ['card-verification', token],
    queryFn: async () => {
      const parsed = qrTokenSchema.safeParse(token ?? '');
      if (!parsed.success) return null;
      const safeToken = parsed.data;
      const { data, error } = await supabase
        .from('card_verification_view' as any)
        .select('*')
        .eq('qr_token', safeToken)
        .maybeSingle();
      if (error) throw error;
      // fire-and-forget scan log (token already validated)
      try { await supabase.rpc('log_card_scan' as any, { _qr_token: safeToken, _meta: {} }); } catch {}
      return data as any;
    },
    enabled: !!token,
  });
};

/** Verificação por qualquer código (token QR, serial Code128 ou nº de registo). */
export const useCardVerificationByCode = (code?: string) => {
  return useQuery({
    queryKey: ['card-verification-code', code],
    queryFn: async () => {
      const parsed = anyCardCodeSchema.safeParse(code ?? '');
      if (!parsed.success) return null;
      const { data, error } = await supabase.rpc('verify_card_by_code' as any, { _code: parsed.data });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return null;
      // fire-and-forget scan log (apenas se temos token)
      if (row.qr_token) {
        try { await supabase.rpc('log_card_scan' as any, { _qr_token: row.qr_token, _meta: { match_kind: row.match_kind } }); } catch {}
      }
      return row as any;
    },
    enabled: !!code,
  });
};
