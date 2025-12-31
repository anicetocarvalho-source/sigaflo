// =============================================================================
// SIGAFLO - Constantes Centralizadas do Sistema
// =============================================================================

// -----------------------------------------------------------------------------
// Estados de Workflow (Padronizados em todo o sistema)
// -----------------------------------------------------------------------------
export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  VALIDATED: 'validated',
  APPROVED: 'approved',
  ISSUED: 'issued',
  REJECTED: 'rejected',
} as const;

export type WorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  draft: 'Rascunho',
  submitted: 'Submetido',
  validated: 'Validado',
  approved: 'Aprovado',
  issued: 'Emitido',
  rejected: 'Rejeitado',
};

export const WORKFLOW_STATUS_COLORS: Record<WorkflowStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  validated: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
  issued: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

// Transições válidas de workflow
export const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  draft: ['submitted'],
  submitted: ['validated', 'rejected'],
  validated: ['approved', 'rejected'],
  approved: ['issued', 'rejected'],
  issued: [],
  rejected: ['draft'],
};

// -----------------------------------------------------------------------------
// Estados de Ocorrências
// -----------------------------------------------------------------------------
export const OCCURRENCE_STATUS = {
  REPORTED: 'reported',
  INVESTIGATING: 'investigating',
  CONFIRMED: 'confirmed',
  RESOLVED: 'resolved',
} as const;

export type OccurrenceStatus = typeof OCCURRENCE_STATUS[keyof typeof OCCURRENCE_STATUS];

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  reported: 'Reportado',
  investigating: 'Em Investigação',
  confirmed: 'Confirmado',
  resolved: 'Resolvido',
};

export const OCCURRENCE_STATUS_COLORS: Record<OccurrenceStatus, string> = {
  reported: 'bg-blue-500/10 text-blue-600',
  investigating: 'bg-yellow-500/10 text-yellow-600',
  confirmed: 'bg-orange-500/10 text-orange-600',
  resolved: 'bg-green-500/10 text-green-600',
};

// -----------------------------------------------------------------------------
// Níveis de Severidade
// -----------------------------------------------------------------------------
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: 'bg-green-500/10 text-green-600',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-orange-500/10 text-orange-600',
  critical: 'bg-red-500/10 text-red-600',
};

// -----------------------------------------------------------------------------
// Tipos de Agricultores
// -----------------------------------------------------------------------------
export const FARMER_TYPES = {
  INDIVIDUAL: 'individual',
  FAMILY: 'family',
  COOPERATIVE: 'cooperative',
  FIELD_SCHOOL: 'field_school',
  COMPANY: 'company',
} as const;

export type FarmerType = typeof FARMER_TYPES[keyof typeof FARMER_TYPES];

export const FARMER_TYPE_LABELS: Record<FarmerType, string> = {
  individual: 'Pequeno Agricultor',
  family: 'Agricultura Familiar',
  cooperative: 'Cooperativa',
  field_school: 'Escola de Campo',
  company: 'Empresa/Grande Produtor',
};

// -----------------------------------------------------------------------------
// Tipos de Ocorrências
// -----------------------------------------------------------------------------
export const OCCURRENCE_TYPES = {
  // Climáticas
  DROUGHT: 'drought',
  FLOOD: 'flood',
  FROST: 'frost',
  STORM: 'storm',
  HEATWAVE: 'heatwave',
  WILDFIRE: 'wildfire',
  HAIL: 'hail',
  // Fitossanitárias
  PEST: 'pest',
  DISEASE: 'disease',
  // Outros
  OTHER: 'other',
} as const;

export type OccurrenceType = typeof OCCURRENCE_TYPES[keyof typeof OCCURRENCE_TYPES];

export const OCCURRENCE_TYPE_LABELS: Record<OccurrenceType, string> = {
  drought: 'Seca',
  flood: 'Inundação',
  frost: 'Geada',
  storm: 'Tempestade',
  heatwave: 'Onda de Calor',
  wildfire: 'Incêndio',
  hail: 'Granizo',
  pest: 'Praga',
  disease: 'Doença',
  other: 'Outro',
};

export const CLIMATE_OCCURRENCE_TYPES: OccurrenceType[] = [
  'drought', 'flood', 'frost', 'storm', 'heatwave', 'wildfire', 'hail'
];

export const PHYTOSANITARY_OCCURRENCE_TYPES: OccurrenceType[] = [
  'pest', 'disease'
];

// -----------------------------------------------------------------------------
// Tipos de Certificados
// -----------------------------------------------------------------------------
export const CERTIFICATE_TYPES = {
  PRODUCER: 'producer',
  ORIGIN: 'origin',
  ORGANIC: 'organic',
  QUALITY: 'quality',
} as const;

export type CertificateType = typeof CERTIFICATE_TYPES[keyof typeof CERTIFICATE_TYPES];

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  producer: 'Certificado de Produtor',
  origin: 'Certificado de Origem',
  organic: 'Certificado Orgânico',
  quality: 'Certificado de Qualidade',
};

// -----------------------------------------------------------------------------
// Épocas Agrícolas
// -----------------------------------------------------------------------------
export const SEASONS = {
  MAIN: 'main',
  SECONDARY: 'secondary',
} as const;

export type Season = typeof SEASONS[keyof typeof SEASONS];

export const SEASON_LABELS: Record<Season, string> = {
  main: 'Época Principal',
  secondary: 'Época Secundária',
};

// -----------------------------------------------------------------------------
// Culturas Comuns em Angola
// -----------------------------------------------------------------------------
export const CROPS = [
  'Milho',
  'Mandioca',
  'Feijão',
  'Arroz',
  'Amendoim',
  'Batata-doce',
  'Sorgo',
  'Banana',
  'Café',
  'Algodão',
  'Soja',
  'Girassol',
  'Hortícolas',
  'Frutas',
  'Cana-de-açúcar',
  'Outros',
] as const;

// -----------------------------------------------------------------------------
// Tipos de Irrigação
// -----------------------------------------------------------------------------
export const IRRIGATION_TYPES = [
  'Sequeiro',
  'Irrigação por gravidade',
  'Irrigação por aspersão',
  'Irrigação gota-a-gota',
  'Irrigação pivot',
  'Misto',
] as const;

// -----------------------------------------------------------------------------
// Províncias de Angola (para referência rápida)
// -----------------------------------------------------------------------------
export const ANGOLA_PROVINCES = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire',
] as const;

// -----------------------------------------------------------------------------
// Moedas
// -----------------------------------------------------------------------------
export const CURRENCIES = {
  AOA: 'AOA',
  USD: 'USD',
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

export const CURRENCY_LABELS: Record<Currency, string> = {
  AOA: 'Kwanza (AOA)',
  USD: 'Dólar (USD)',
};

// -----------------------------------------------------------------------------
// Limites de Validação
// -----------------------------------------------------------------------------
export const VALIDATION_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 100,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 2000,
  PHONE_MAX: 20,
  EMAIL_MAX: 255,
  NOTES_MAX: 500,
  AREA_MIN: 0,
  AREA_MAX: 1000000, // 1 milhão de hectares
  COORDINATE_LAT_MIN: -90,
  COORDINATE_LAT_MAX: 90,
  COORDINATE_LNG_MIN: -180,
  COORDINATE_LNG_MAX: 180,
  YEAR_MIN: 2000,
  YEAR_MAX: 2100,
} as const;
