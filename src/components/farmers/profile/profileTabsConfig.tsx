import {
  User, Home, FileText, CreditCard, Calendar, Award, CloudRain, Wallet,
  BarChart3, Users, LandPlot, ShoppingCart, Fingerprint, Eye, Tractor,
  Activity, Building2, GraduationCap,
} from 'lucide-react';

export type FarmerType = 'individual' | 'family' | 'cooperative' | 'field_school' | 'company';

export type TabValue =
  | 'identification' | 'household' | 'documents' | 'card' | 'biometry' | 'entity-details'
  | 'parcels' | 'campaigns' | 'production' | 'mechanization' | 'members'
  | 'agropay' | 'purchases' | 'incentives' | 'scores' | 'certificates'
  | 'occurrences' | 'monitoring' | 'forecast'
  | 'representatives';

export type GroupKey = 'identification' | 'operation' | 'financial' | 'monitoring' | 'governance';

export interface TabDef {
  value: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Tipos para os quais a tab aparece no menu de navegação. */
  visibleFor?: FarmerType[];
  /**
   * Tipos para os quais a tab é acessível via URL/deep-link mesmo quando
   * está oculta no menu. O conteúdo deve renderizar um empty state explicativo.
   */
  deepLinkableFor?: FarmerType[];
}

export interface GroupDef {
  key: GroupKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tabs: TabDef[];
}

export const PROFILE_GROUPS: GroupDef[] = [
  {
    key: 'identification',
    label: 'Identificação',
    icon: User,
    tabs: [
      { value: 'identification', label: 'Dados Gerais', icon: User },
      { value: 'household', label: 'Agregado', icon: Home, visibleFor: ['individual'] },
      { value: 'entity-details', label: 'Detalhes da Cooperativa', icon: Building2, visibleFor: ['cooperative'] },
      { value: 'entity-details', label: 'Detalhes da ECA', icon: GraduationCap, visibleFor: ['field_school'] },
      { value: 'documents', label: 'Documentos', icon: FileText },
      { value: 'card', label: 'Cartão / Certificado', icon: CreditCard, visibleFor: ['individual', 'family', 'company'] },
      { value: 'biometry', label: 'Biometria', icon: Fingerprint, visibleFor: ['individual', 'family'] },
    ],
  },
  {
    key: 'operation',
    label: 'Operação',
    icon: LandPlot,
    tabs: [
      { value: 'parcels', label: 'Parcelas', icon: LandPlot, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'campaigns', label: 'Campanhas', icon: Calendar, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'production', label: 'Produção', icon: Calendar, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'mechanization', label: 'Mecanização', icon: Tractor, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'members', label: 'Membros', icon: Users, visibleFor: ['cooperative', 'field_school'] },
    ],
  },
  {
    key: 'financial',
    label: 'Financeiro',
    icon: Wallet,
    tabs: [
      { value: 'agropay', label: 'AgroPay', icon: Wallet, visibleFor: ['individual', 'family', 'company'] },
      { value: 'purchases', label: 'Compras', icon: ShoppingCart, visibleFor: ['individual', 'family', 'company'] },
      { value: 'incentives', label: 'Incentivos', icon: Wallet, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'scores', label: 'Scores', icon: BarChart3, visibleFor: ['individual', 'family', 'company'] },
      { value: 'certificates', label: 'Certificados', icon: Award, visibleFor: ['individual', 'family', 'company'] },
    ],
  },
  {
    key: 'monitoring',
    label: 'Monitoria',
    icon: Activity,
    tabs: [
      { value: 'occurrences', label: 'Ocorrências', icon: CloudRain },
      { value: 'monitoring', label: 'NDVI / Alertas', icon: Activity, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'forecast', label: 'Previsão', icon: Eye, visibleFor: ['individual', 'family', 'company'] },
    ],
  },
  {
    key: 'governance',
    label: 'Governança',
    icon: Users,
    tabs: [
      { value: 'representatives', label: 'Representantes', icon: Users, visibleFor: ['individual', 'family', 'company'] },
    ],
  },
];

export const ALL_TAB_VALUES: TabValue[] = Array.from(
  new Set(PROFILE_GROUPS.flatMap((g) => g.tabs.map((t) => t.value)))
) as TabValue[];

export function getVisibleTabs(group: GroupDef, type: FarmerType): TabDef[] {
  return group.tabs.filter((t) => !t.visibleFor || t.visibleFor.includes(type));
}

export function findGroupForTab(tab: string): GroupKey {
  for (const g of PROFILE_GROUPS) {
    if (g.tabs.some((t) => t.value === tab)) return g.key;
  }
  return 'identification';
}

/** Conjunto canónico de tabs disponíveis por tipo de entidade (para gating em código). */
export function isTabAllowedForType(tab: TabValue, type: FarmerType): boolean {
  for (const g of PROFILE_GROUPS) {
    const def = g.tabs.find((t) => t.value === tab);
    if (def) {
      return !def.visibleFor || def.visibleFor.includes(type);
    }
  }
  return false;
}
