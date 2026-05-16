// =============================================================================
// SIGAFLO - Esquemas de Validação Centralizados (Zod)
// =============================================================================

import { z } from 'zod';
import { VALIDATION_LIMITS } from './constants';

// -----------------------------------------------------------------------------
// Mensagens de Erro em Português
// -----------------------------------------------------------------------------
const errorMessages = {
  required: 'Este campo é obrigatório',
  invalidEmail: 'Endereço de email inválido',
  invalidPhone: 'Número de telefone inválido',
  tooShort: (min: number) => `Mínimo de ${min} caracteres`,
  tooLong: (max: number) => `Máximo de ${max} caracteres`,
  positiveNumber: 'O valor deve ser positivo',
  invalidYear: 'Ano inválido',
  invalidCoordinate: 'Coordenada inválida',
  selectOption: 'Selecione uma opção',
  invalidUuid: 'Identificador inválido',
  minValue: (min: number) => `Valor mínimo: ${min}`,
  maxValue: (max: number) => `Valor máximo: ${max}`,
};

// -----------------------------------------------------------------------------
// Campos Base Reutilizáveis
// -----------------------------------------------------------------------------

// Nome/Título obrigatório
export const nameSchema = z
  .string()
  .trim()
  .min(VALIDATION_LIMITS.NAME_MIN, errorMessages.tooShort(VALIDATION_LIMITS.NAME_MIN))
  .max(VALIDATION_LIMITS.NAME_MAX, errorMessages.tooLong(VALIDATION_LIMITS.NAME_MAX));

// Nome opcional
export const optionalNameSchema = z
  .string()
  .trim()
  .max(VALIDATION_LIMITS.NAME_MAX, errorMessages.tooLong(VALIDATION_LIMITS.NAME_MAX))
  .optional()
  .nullable();

// Email obrigatório
export const emailSchema = z
  .string()
  .trim()
  .email(errorMessages.invalidEmail)
  .max(VALIDATION_LIMITS.EMAIL_MAX, errorMessages.tooLong(VALIDATION_LIMITS.EMAIL_MAX));

// Email opcional (permite vazio)
export const optionalEmailSchema = z
  .string()
  .trim()
  .email(errorMessages.invalidEmail)
  .max(VALIDATION_LIMITS.EMAIL_MAX, errorMessages.tooLong(VALIDATION_LIMITS.EMAIL_MAX))
  .optional()
  .nullable()
  .or(z.literal(''));

// Telefone opcional
export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(VALIDATION_LIMITS.PHONE_MAX, errorMessages.tooLong(VALIDATION_LIMITS.PHONE_MAX))
  .optional()
  .nullable();

// Descrição obrigatória
export const descriptionSchema = z
  .string()
  .trim()
  .min(VALIDATION_LIMITS.DESCRIPTION_MIN, errorMessages.tooShort(VALIDATION_LIMITS.DESCRIPTION_MIN))
  .max(VALIDATION_LIMITS.DESCRIPTION_MAX, errorMessages.tooLong(VALIDATION_LIMITS.DESCRIPTION_MAX));

// Descrição opcional
export const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(VALIDATION_LIMITS.DESCRIPTION_MAX, errorMessages.tooLong(VALIDATION_LIMITS.DESCRIPTION_MAX))
  .optional()
  .nullable();

// Notas/Observações opcionais
export const notesSchema = z
  .string()
  .trim()
  .max(VALIDATION_LIMITS.NOTES_MAX, errorMessages.tooLong(VALIDATION_LIMITS.NOTES_MAX))
  .optional()
  .nullable();

// UUID obrigatório (para selects com IDs)
export const uuidSchema = z
  .string()
  .uuid(errorMessages.invalidUuid);

// UUID para select obrigatório (min 1 para validar seleção)
export const requiredSelectSchema = z
  .string()
  .min(1, errorMessages.selectOption);

// UUID opcional
export const optionalUuidSchema = z
  .string()
  .uuid(errorMessages.invalidUuid)
  .optional()
  .nullable();

// Ano
export const yearSchema = z
  .coerce
  .number()
  .int()
  .min(VALIDATION_LIMITS.YEAR_MIN, errorMessages.minValue(VALIDATION_LIMITS.YEAR_MIN))
  .max(VALIDATION_LIMITS.YEAR_MAX, errorMessages.maxValue(VALIDATION_LIMITS.YEAR_MAX));

// Número positivo obrigatório
export const positiveNumberSchema = z
  .coerce
  .number()
  .min(0, errorMessages.positiveNumber);

// Número positivo opcional
export const optionalPositiveNumberSchema = z
  .coerce
  .number()
  .min(0, errorMessages.positiveNumber)
  .optional()
  .nullable();

// Área em hectares
export const areaSchema = z
  .coerce
  .number()
  .min(VALIDATION_LIMITS.AREA_MIN, errorMessages.positiveNumber)
  .max(VALIDATION_LIMITS.AREA_MAX, errorMessages.maxValue(VALIDATION_LIMITS.AREA_MAX));

// Área opcional
export const optionalAreaSchema = z
  .coerce
  .number()
  .min(VALIDATION_LIMITS.AREA_MIN, errorMessages.positiveNumber)
  .max(VALIDATION_LIMITS.AREA_MAX, errorMessages.maxValue(VALIDATION_LIMITS.AREA_MAX))
  .optional()
  .nullable();

// Latitude
export const latitudeSchema = z
  .coerce
  .number()
  .min(VALIDATION_LIMITS.COORDINATE_LAT_MIN, errorMessages.invalidCoordinate)
  .max(VALIDATION_LIMITS.COORDINATE_LAT_MAX, errorMessages.invalidCoordinate);

// Latitude opcional
export const optionalLatitudeSchema = z
  .coerce
  .number()
  .min(VALIDATION_LIMITS.COORDINATE_LAT_MIN, errorMessages.invalidCoordinate)
  .max(VALIDATION_LIMITS.COORDINATE_LAT_MAX, errorMessages.invalidCoordinate)
  .optional()
  .nullable();

// Longitude
export const longitudeSchema = z
  .coerce
  .number()
  .min(VALIDATION_LIMITS.COORDINATE_LNG_MIN, errorMessages.invalidCoordinate)
  .max(VALIDATION_LIMITS.COORDINATE_LNG_MAX, errorMessages.invalidCoordinate);

// Longitude opcional
export const optionalLongitudeSchema = z
  .coerce
  .number()
  .min(VALIDATION_LIMITS.COORDINATE_LNG_MIN, errorMessages.invalidCoordinate)
  .max(VALIDATION_LIMITS.COORDINATE_LNG_MAX, errorMessages.invalidCoordinate)
  .optional()
  .nullable();

// -----------------------------------------------------------------------------
// Esquemas de Formulários Específicos
// -----------------------------------------------------------------------------

// Produtor/Agricultor
export const farmerFormSchema = z.object({
  farmer_type: z.enum(['individual', 'family', 'cooperative', 'field_school', 'company'], {
    required_error: errorMessages.selectOption,
  }),
  name: nameSchema,
  trade_name: optionalNameSchema,
  bi_nif: z.string().max(20).optional().nullable(),
  phone: optionalPhoneSchema,
  email: optionalEmailSchema,
  province_id: optionalUuidSchema,
  municipality_id: optionalUuidSchema,
  commune_id: optionalUuidSchema,
  village: z.string().max(100).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  latitude: optionalLatitudeSchema,
  longitude: optionalLongitudeSchema,
  total_area_ha: optionalAreaSchema,
  cultivated_area_ha: optionalAreaSchema,
  main_crops: z.array(z.string()).optional().nullable(),
  irrigation_type: z.string().max(50).optional().nullable(),
  parent_cooperative_id: optionalUuidSchema,
  field_school_id: optionalUuidSchema,
});

// Tipo de Grão (enum sincronizado com Supabase)
const grainTypeSchema = z.enum([
  'arroz', 'milho', 'trigo', 'sorgo', 'massambala', 'massango', 'cevada', 'aveia',
], { errorMap: () => ({ message: 'Tipo de grão inválido' }) });

// Produção de Grãos
export const riceProductionFormSchema = z.object({
  grain_type: grainTypeSchema,
  province_id: requiredSelectSchema,
  year: yearSchema,
  season: requiredSelectSchema,
  cultivated_area_ha: positiveNumberSchema,
  harvested_area_ha: positiveNumberSchema,
  production_tonnes: positiveNumberSchema,
  variety: z.string().optional(),
  irrigation_type: z.string().optional(),
  notes: notesSchema,
});

// Importação de Grãos
export const riceImportFormSchema = z.object({
  grain_type: grainTypeSchema,
  year: yearSchema,
  month: z.coerce.number().int().min(1, 'Mês inválido').max(12, 'Mês inválido'),
  volume_tons: positiveNumberSchema,
  origin_country: requiredSelectSchema,
  price_fob_usd: positiveNumberSchema,
  price_cif_usd: positiveNumberSchema,
  importer_name: nameSchema,
  rice_type: z.string().optional(),
  notes: notesSchema,
});

// Preço de Grãos
export const ricePriceFormSchema = z.object({
  grain_type: grainTypeSchema,
  province_id: requiredSelectSchema,
  recorded_date: z.string().min(1, errorMessages.required),
  retail_price_aoa: positiveNumberSchema,
  wholesale_price_aoa: positiveNumberSchema,
  rice_type: z.string().optional(),
  market_name: z.string().max(100).optional(),
  notes: notesSchema,
});

// Ocorrência
export const occurrenceFormSchema = z.object({
  description: z.string()
    .min(20, 'Descreva a situação com pelo menos 20 caracteres')
    .max(2000, 'Descrição muito longa'),
  province_id: requiredSelectSchema,
  municipality_id: z.string().optional(),
  commune_id: z.string().optional(),
});

// Histórico de Produção
export const productionHistoryFormSchema = z.object({
  farmer_id: requiredSelectSchema,
  year: yearSchema,
  season: requiredSelectSchema,
  crop_type: requiredSelectSchema,
  area_ha: positiveNumberSchema,
  yield_kg: positiveNumberSchema,
  quality: z.string().optional(),
  harvest_date: z.string().optional(),
  notes: notesSchema,
});

// Certificado Agrícola
export const certificateFormSchema = z.object({
  farmer_id: requiredSelectSchema,
  certificate_type: requiredSelectSchema,
  year: yearSchema,
  season: requiredSelectSchema,
  crops: z.array(z.string()).min(1, 'Selecione pelo menos uma cultura'),
  total_area_ha: optionalAreaSchema,
  total_quantity_kg: optionalPositiveNumberSchema,
  production_history_id: optionalUuidSchema,
});

// Utilizador
export const createUserFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
  full_name: nameSchema,
  phone: optionalPhoneSchema,
  position: optionalNameSchema,
  department: optionalNameSchema,
  province_id: z.string().optional(),
  municipality_id: z.string().optional(),
  role: z.string().optional(),
});

export const editUserFormSchema = z.object({
  full_name: nameSchema,
  phone: optionalPhoneSchema,
  position: optionalNameSchema,
  department: optionalNameSchema,
  province_id: z.string().optional(),
  municipality_id: z.string().optional(),
});

// -----------------------------------------------------------------------------
// Tipos Inferidos
// -----------------------------------------------------------------------------
export type FarmerFormValues = z.infer<typeof farmerFormSchema>;
export type RiceProductionFormValues = z.infer<typeof riceProductionFormSchema>;
export type RiceImportFormValues = z.infer<typeof riceImportFormSchema>;
export type RicePriceFormValues = z.infer<typeof ricePriceFormSchema>;
export type OccurrenceFormValues = z.infer<typeof occurrenceFormSchema>;
export type ProductionHistoryFormValues = z.infer<typeof productionHistoryFormSchema>;
export type CertificateFormValues = z.infer<typeof certificateFormSchema>;
export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type EditUserFormValues = z.infer<typeof editUserFormSchema>;
