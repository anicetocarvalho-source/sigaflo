/**
 * Helpers de rótulos do fluxo Aprovação → Emissão/Activação.
 * Centralizados para garantir consistência entre UI e testes.
 *
 * Regra: cooperativas e escolas de campo NÃO emitem cartão SIGAFLO.
 * Para esses tipos, a transição final do workflow é "Activar Registo"
 * e o estado final é apresentado como "Activo" em vez de "Emitido".
 */

export const CARD_ELIGIBLE_TYPES = new Set(['individual', 'family', 'company']);

export const isCardEligibleType = (farmerType?: string | null): boolean => {
  if (!farmerType) return true; // por defeito assume elegível (compat)
  return CARD_ELIGIBLE_TYPES.has(farmerType);
};

export const getFinalTransitionLabel = (farmerType?: string | null): string =>
  isCardEligibleType(farmerType) ? 'Emitir Cartão' : 'Activar Registo';

export const getFinalTransitionDescription = (farmerType?: string | null): string =>
  isCardEligibleType(farmerType)
    ? 'Emitir o cartão do agricultor (nível nacional)'
    : 'Activar o registo aprovado (nível nacional). Esta entidade não emite cartão SIGAFLO.';

export const getIssuedStateLabel = (farmerType?: string | null): string =>
  isCardEligibleType(farmerType) ? 'Emitido' : 'Activo';
