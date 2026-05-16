// Catálogo central de tipos de grão suportados pelo módulo "Grãos" (ex-Arroz).
// Mantém em sincronia com o enum `grain_type` no Supabase.

export type GrainType =
  | 'arroz'
  | 'milho'
  | 'trigo'
  | 'sorgo'
  | 'massambala'
  | 'massango'
  | 'cevada'
  | 'aveia';

export interface GrainMeta {
  value: GrainType;
  label: string;
  emoji: string;
  color: string; // HSL token-friendly
  description: string;
}

export const GRAIN_TYPES: GrainMeta[] = [
  { value: 'arroz',       label: 'Arroz',       emoji: '🌾', color: 'hsl(var(--primary))',  description: 'Cereal estratégico para soberania alimentar' },
  { value: 'milho',       label: 'Milho',       emoji: '🌽', color: 'hsl(var(--warning))',  description: 'Cereal base da dieta angolana' },
  { value: 'trigo',       label: 'Trigo',       emoji: '🌿', color: 'hsl(var(--accent))',   description: 'Maioritariamente importado' },
  { value: 'sorgo',       label: 'Sorgo',       emoji: '🌾', color: 'hsl(var(--success))',  description: 'Resistente à seca, planalto central' },
  { value: 'massambala',  label: 'Massambala',  emoji: '🌾', color: 'hsl(var(--info))',     description: 'Sorgo tradicional angolano' },
  { value: 'massango',    label: 'Massango',    emoji: '🌾', color: 'hsl(var(--destructive))', description: 'Milheto tradicional' },
  { value: 'cevada',      label: 'Cevada',      emoji: '🌾', color: 'hsl(var(--muted-foreground))', description: 'Cereal de inverno' },
  { value: 'aveia',       label: 'Aveia',       emoji: '🌾', color: 'hsl(var(--secondary-foreground))', description: 'Cereal complementar' },
];

export const GRAIN_LABELS: Record<GrainType, string> = GRAIN_TYPES.reduce(
  (acc, g) => ({ ...acc, [g.value]: g.label }),
  {} as Record<GrainType, string>,
);

export const GRAIN_COLORS: Record<GrainType, string> = GRAIN_TYPES.reduce(
  (acc, g) => ({ ...acc, [g.value]: g.color }),
  {} as Record<GrainType, string>,
);

export const GRAIN_VALUES: GrainType[] = GRAIN_TYPES.map((g) => g.value);

export const DEFAULT_GRAIN: GrainType = 'arroz';

export const isGrainType = (v: unknown): v is GrainType =>
  typeof v === 'string' && GRAIN_VALUES.includes(v as GrainType);

export const getGrainLabel = (v: string | null | undefined): string =>
  v && isGrainType(v) ? GRAIN_LABELS[v] : '—';
