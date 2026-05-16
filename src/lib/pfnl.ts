// PFNL — Produtos Florestais Não-Lenhosos (Non-Wood Forest Products)
// Contexto: Angola (miombo, mata de panda, savanas)

export type ActivityCategory = 'agricultural' | 'pfnl' | 'mixed';

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string; description: string }[] = [
  {
    value: 'agricultural',
    label: 'Agrícola',
    description: 'Produção agrícola tradicional (culturas, hortícolas, frutas).',
  },
  {
    value: 'pfnl',
    label: 'PFNL (Produtos Florestais Não-Lenhosos)',
    description: 'Recolha de mel silvestre, plantas medicinais, frutos silvestres, resinas, etc.',
  },
  {
    value: 'mixed',
    label: 'Misto (Agrícola + PFNL)',
    description: 'Combina produção agrícola com recolha de produtos florestais não-lenhosos.',
  },
];

export const PFNL_PRODUCTS = [
  'Mel silvestre e cera',
  'Cogumelos silvestres',
  'Plantas medicinais',
  'Frutos silvestres (múcua, maboque, ngangaria)',
  'Resinas e gomas',
  'Óleos vegetais não cultivados',
  'Fibras e folhas',
  'Tubérculos silvestres',
  'Outros PFNL',
] as const;

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  agricultural: 'Agrícola',
  pfnl: 'PFNL',
  mixed: 'Misto',
};

export const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  agricultural: 'bg-green-100 text-green-800',
  pfnl: 'bg-amber-100 text-amber-800',
  mixed: 'bg-blue-100 text-blue-800',
};
