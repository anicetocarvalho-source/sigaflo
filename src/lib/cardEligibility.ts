import type { Farmer } from '@/hooks/useFarmers';

export type EligibilityModule = 'credit' | 'incentive' | 'insurance' | 'pos_subsidy' | 'mechanization';

export interface EligibilityCheck {
  module: EligibilityModule;
  label: string;
  eligible: boolean;
  reason: string;
  route?: string;
}

export interface EligibilityReport {
  hasActiveCard: boolean;
  cardStatus?: string;
  checks: EligibilityCheck[];
  unlockedCount: number;
  totalCount: number;
}

const MODULE_META: Record<EligibilityModule, { label: string; route: string }> = {
  credit: { label: 'Crédito Agrícola', route: '/credit-insurance' },
  incentive: { label: 'Incentivos & Subsídios', route: '/incentives' },
  insurance: { label: 'Seguro Agrícola', route: '/insurance' },
  pos_subsidy: { label: 'Pacotes Subsidiados (POS)', route: '/pos/pacotes' },
  mechanization: { label: 'Mecanização Agrícola', route: '/mechanization' },
};

interface CardLike {
  card_status?: string | null;
  delivered_at?: string | null;
  printed_at?: string | null;
}

/**
 * Calcula elegibilidade para crédito, incentivos, seguro, pacotes POS e mecanização
 * com base nos dados do agricultor e estado do cartão SIGAFLO.
 *
 * Regras simples e auditáveis (alinhadas com as memórias `credit-productive-identity`,
 * `incentives-management` e `subsidized-purchase-quotas-management`).
 */
export function evaluateEligibility(farmer: Farmer, card?: CardLike | null): EligibilityReport {
  const hasActiveCard = !!card && card.card_status !== 'revogado';
  const cardActivated = hasActiveCard && (card?.card_status === 'entregue' || card?.card_status === 'impresso');

  const area = Number(farmer.cultivated_area_ha ?? 0);
  const hasCrops = (farmer.main_crops?.length ?? 0) > 0;
  const hasBI = !!farmer.bi_nif;
  const hasGeo = !!farmer.provinces?.name && !!farmer.municipalities?.name;
  const isCooperative = farmer.farmer_type === 'cooperative' || farmer.farmer_type === 'company';

  const checks: EligibilityCheck[] = [];

  // Crédito: cartão activo + BI + área >= 0.5ha + culturas declaradas
  {
    const reasons: string[] = [];
    if (!hasActiveCard) reasons.push('cartão SIGAFLO não emitido');
    if (!hasBI) reasons.push('falta BI/NIF');
    if (area < 0.5) reasons.push('área cultivada < 0,5 ha');
    if (!hasCrops) reasons.push('sem culturas declaradas');
    checks.push({
      module: 'credit',
      label: MODULE_META.credit.label,
      route: MODULE_META.credit.route,
      eligible: reasons.length === 0,
      reason: reasons.length === 0
        ? `Cartão activo, BI registado, ${area} ha cultivados — habilita dossiê de crédito.`
        : reasons.join(' · '),
    });
  }

  // Incentivos: cartão activo + georreferenciação
  {
    const reasons: string[] = [];
    if (!hasActiveCard) reasons.push('cartão não emitido');
    if (!hasGeo) reasons.push('sem província/município definidos');
    checks.push({
      module: 'incentive',
      label: MODULE_META.incentive.label,
      route: MODULE_META.incentive.route,
      eligible: reasons.length === 0,
      reason: reasons.length === 0
        ? `Localização confirmada (${farmer.provinces?.name}/${farmer.municipalities?.name}) — elegível a programas activos.`
        : reasons.join(' · '),
    });
  }

  // Seguro paramétrico: cartão activo + área >= 1 ha
  {
    const reasons: string[] = [];
    if (!hasActiveCard) reasons.push('cartão não emitido');
    if (area < 1) reasons.push('área < 1 ha (mínimo para apólice)');
    checks.push({
      module: 'insurance',
      label: MODULE_META.insurance.label,
      route: MODULE_META.insurance.route,
      eligible: reasons.length === 0,
      reason: reasons.length === 0
        ? `Área ${area} ha qualifica para cotação de seguro paramétrico.`
        : reasons.join(' · '),
    });
  }

  // Pacotes subsidiados POS: cartão entregue/impresso (precisa físico) + culturas
  {
    const reasons: string[] = [];
    if (!cardActivated) reasons.push('cartão ainda não impresso/entregue');
    if (!hasCrops) reasons.push('cultura principal não definida');
    checks.push({
      module: 'pos_subsidy',
      label: MODULE_META.pos_subsidy.label,
      route: MODULE_META.pos_subsidy.route,
      eligible: reasons.length === 0,
      reason: reasons.length === 0
        ? `Cartão físico válido — quota subsidiada 70/30 disponível para ${farmer.main_crops?.[0]}.`
        : reasons.join(' · '),
    });
  }

  // Mecanização: cartão activo + área >= 2ha OU cooperativa
  {
    const reasons: string[] = [];
    if (!hasActiveCard) reasons.push('cartão não emitido');
    if (area < 2 && !isCooperative) reasons.push('área < 2 ha e não é cooperativa/empresa');
    checks.push({
      module: 'mechanization',
      label: MODULE_META.mechanization.label,
      route: MODULE_META.mechanization.route,
      eligible: reasons.length === 0,
      reason: reasons.length === 0
        ? isCooperative
          ? 'Cooperativa/Empresa elegível a OSM a preço subsidiado.'
          : `${area} ha cumprem o mínimo de 2 ha para ordens de serviço mecanizado.`
        : reasons.join(' · '),
    });
  }

  return {
    hasActiveCard,
    cardStatus: card?.card_status ?? undefined,
    checks,
    unlockedCount: checks.filter((c) => c.eligible).length,
    totalCount: checks.length,
  };
}
