// Catálogo central de módulos do SIGAFLO usado para RBAC por módulo.
// Mantém em sincronia com o enum app_module no Supabase.

export type AppModule =
  | 'farmers'
  | 'forestry'
  | 'coffee'
  | 'rice'
  | 'pos'
  | 'mechanization'
  | 'credit_insurance'
  | 'incentives'
  | 'climate_risk'
  | 'ipn'
  | 'data_lab'
  | 'occurrences';

export const MODULE_LABELS: Record<AppModule, string> = {
  farmers: 'Cadastro de Produtores',
  forestry: 'Gestão Florestal',
  coffee: 'Cadeia do Café',
  rice: 'Produção de Arroz',
  pos: 'Vendas & POS',
  mechanization: 'Mecanização Agrícola',
  credit_insurance: 'Crédito & Seguros',
  incentives: 'Gestão de Incentivos',
  climate_risk: 'Risco Climático',
  ipn: 'Identidade Produtiva (IPN)',
  data_lab: 'Laboratório de Dados / ONAF',
  occurrences: 'Ocorrências Fitossanitárias',
};

export const ALL_MODULES: AppModule[] = Object.keys(MODULE_LABELS) as AppModule[];

/**
 * Mapeia um caminho de rota para o módulo correspondente.
 * Devolve null se a rota não pertence a nenhum módulo restrito.
 */
export function getModuleForPath(pathname: string): AppModule | null {
  if (pathname.startsWith('/agricultores') || pathname.startsWith('/parcelas') ||
      pathname.startsWith('/cadastro-campo') || pathname.startsWith('/cadastro-externo') ||
      pathname.startsWith('/certificados') || pathname.startsWith('/producao') ||
      pathname.startsWith('/tecnicos') || pathname.startsWith('/cooperativas') ||
      pathname.startsWith('/escolas-campo') || pathname.startsWith('/infraestruturas')) {
    return 'farmers';
  }
  if (pathname.startsWith('/florestal')) return 'forestry';
  if (pathname.startsWith('/cafe')) return 'coffee';
  if (pathname.startsWith('/arroz')) return 'rice';
  if (pathname.startsWith('/pos') || pathname.startsWith('/faturas') ||
      pathname.startsWith('/compras') || pathname.startsWith('/pacotes-compras')) return 'pos';
  if (pathname.startsWith('/mecanizacao')) return 'mechanization';
  if (pathname.startsWith('/credito-seguro') || pathname.startsWith('/seguros')) return 'credit_insurance';
  if (pathname.startsWith('/incentivos')) return 'incentives';
  if (pathname.startsWith('/risco-climatico')) return 'climate_risk';
  if (pathname.startsWith('/ipn')) return 'ipn';
  if (pathname.startsWith('/laboratorio-dados') || pathname.startsWith('/onaf')) return 'data_lab';
  if (pathname.startsWith('/ocorrencias') || pathname.startsWith('/monitoria')) return 'occurrences';
  return null;
}
