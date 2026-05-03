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
  visibleFor?: FarmerType[];
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
      { value: 'card', label: 'Cartão / Certificado', icon: CreditCard },
      { value: 'biometry', label: 'Biometria', icon: Fingerprint, visibleFor: ['individual', 'family'] },
    ],
  },
  {
    key: 'operation',
    label: 'Operação',
    icon: LandPlot,
    tabs: [
      { value: 'parcels', label: 'Parcelas', icon: LandPlot },
      { value: 'campaigns', label: 'Campanhas', icon: Calendar },
      { value: 'production', label: 'Produção', icon: Calendar },
      { value: 'mechanization', label: 'Mecanização', icon: Tractor, visibleFor: ['individual', 'family', 'company', 'cooperative'] },
      { value: 'members', label: 'Membros', icon: Users, visibleFor: ['cooperative', 'field_school'] },
    ],
  },
  {
    key: 'financial',
    label: 'Financeiro',
    icon: Wallet,
    tabs: [
      { value: 'agropay', label: 'AgroPay', icon: Wallet },
      { value: 'purchases', label: 'Compras', icon: ShoppingCart },
      { value: 'incentives', label: 'Incentivos', icon: Wallet },
      { value: 'scores', label: 'Scores', icon: BarChart3 },
      { value: 'certificates', label: 'Certificados', icon: Award },
    ],
  },
  {
    key: 'monitoring',
    label: 'Monitoria',
    icon: Activity,
    tabs: [
      { value: 'occurrences', label: 'Ocorrências', icon: CloudRain },
      { value: 'monitoring', label: 'NDVI / Alertas', icon: Activity },
      { value: 'forecast', label: 'Previsão', icon: Eye },
    ],
  },
  {
    key: 'governance',
    label: 'Governança',
    icon: Users,
    tabs: [
      { value: 'representatives', label: 'Representantes', icon: Users },
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
