import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, User, Leaf, Building2, Users, FileText, Camera, Award, Home } from 'lucide-react';
import { useProvinces, useMunicipalities, useCommunes, useFarmers } from '@/hooks/useFarmers';
import { supabase } from '@/integrations/supabase/client';
import type { Farmer, FarmerType } from '@/hooks/useFarmers';
import { MemberSelector } from './MemberSelector';
import { PhotoUpload } from './PhotoUpload';
import { DocumentUpload } from './DocumentUpload';
import { FingerprintCapture } from './FingerprintCapture';
import { toast } from 'sonner';
import { optionalEmailSchema, optionalPhoneAOSchema, optionalBiOrNifSchema, normalizeBiOrNif } from '@/lib/validation';
import { PhoneInputAO } from '@/components/ui/phone-input-ao';
import { EmailInput } from '@/components/ui/email-input';
import { Textarea } from '@/components/ui/textarea';
import { ACTIVITY_CATEGORIES, PFNL_PRODUCTS, type ActivityCategory } from '@/lib/pfnl';

const farmerSchema = z.object({
  farmer_type: z.enum(['individual', 'family', 'cooperative', 'field_school', 'company']),
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Máximo de 100 caracteres'),
  trade_name: z.string().max(100, 'Máximo de 100 caracteres').optional().nullable(),
  bi_nif: optionalBiOrNifSchema,
  phone: optionalPhoneAOSchema,
  email: optionalEmailSchema,
  province_id: z.string().uuid().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  commune_id: z.string().uuid().optional().nullable(),
  village: z.string().max(100, 'Máximo de 100 caracteres').optional().nullable(),
  address: z.string().max(255, 'Máximo de 255 caracteres').optional().nullable(),
  latitude: z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida').optional().nullable(),
  longitude: z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida').optional().nullable(),
  total_area_ha: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  cultivated_area_ha: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  main_crops: z.array(z.string()).optional().nullable(),
  irrigation_type: z.string().max(50, 'Máximo de 50 caracteres').optional().nullable(),
  // PFNL — Produtos Florestais Não-Lenhosos
  activity_category: z.enum(['agricultural', 'pfnl', 'mixed']).default('agricultural'),
  pfnl_products: z.array(z.string()).max(15, 'Máximo de 15 produtos').optional().nullable(),
  pfnl_collection_area_ha: z
    .number()
    .min(0.01, 'A área de coleta deve ser superior a 0')
    .max(100000, 'Área de coleta irrealista (máx. 100.000 ha)')
    .optional()
    .nullable(),
  pfnl_target_species: z
    .array(z.string().trim().min(2, 'Cada espécie deve ter pelo menos 2 caracteres').max(80, 'Máximo de 80 caracteres por espécie'))
    .max(20, 'Máximo de 20 espécies')
    .optional()
    .nullable(),
  pfnl_seasonality: z.string().max(255, 'Máximo de 255 caracteres').optional().nullable(),
  pfnl_forest_authorization_ref: z
    .string()
    .trim()
    .max(100, 'Máximo de 100 caracteres')
    .optional()
    .nullable(),
  parent_cooperative_id: z.string().uuid().optional().nullable(),
  field_school_id: z.string().uuid().optional().nullable(),
  // Fields for individual/family farmers
  photo_url: z.string().optional().nullable(),
  fingerprint_data: z.string().optional().nullable(),
  document_bi_url: z.string().optional().nullable(),
  document_other_url: z.string().optional().nullable(),
  // Fields for company documents
  document_license_url: z.string().optional().nullable(),
  document_nif_url: z.string().optional().nullable(),
  // Fields for household/family aggregate
  household_members_count: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  dependents_count: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  spouse_name: z.string().max(100, 'Máximo de 100 caracteres').optional().nullable(),
  spouse_bi_nif: optionalBiOrNifSchema,
  children_count: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  children_under_5: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  children_5_to_14: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  children_15_to_18: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  family_workers_count: z.number().min(0, 'O valor deve ser positivo').optional().nullable(),
  head_of_household: z.boolean().optional().nullable(),
  household_notes: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.activity_category && data.activity_category !== 'agricultural') {
    if (!data.pfnl_products || data.pfnl_products.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pfnl_products'],
        message: 'Selecione pelo menos um produto PFNL.',
      });
    }
    if (
      data.pfnl_collection_area_ha === null ||
      data.pfnl_collection_area_ha === undefined ||
      Number.isNaN(data.pfnl_collection_area_ha)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pfnl_collection_area_ha'],
        message: 'Indique a área (em hectares) da zona de coleta.',
      });
    }
    if (!data.pfnl_target_species || data.pfnl_target_species.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pfnl_target_species'],
        message: 'Indique pelo menos uma espécie-alvo.',
      });
    }
    const ref = (data.pfnl_forest_authorization_ref ?? '').trim();
    if (ref.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pfnl_forest_authorization_ref'],
        message: 'Referência da autorização florestal é obrigatória para PFNL.',
      });
    } else if (ref.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pfnl_forest_authorization_ref'],
        message: 'Referência demasiado curta (mínimo 4 caracteres).',
      });
    }
  }
});

type FarmerFormData = z.infer<typeof farmerSchema>;

export interface FarmerFormSubmitData extends FarmerFormData {
  memberIds?: string[];
}

interface FarmerFormProps {
  farmer?: Farmer | null;
  onSubmit: (data: FarmerFormSubmitData) => void;
  isLoading?: boolean;
  defaultCooperativeId?: string;
  defaultFieldSchoolId?: string;
}

const farmerTypeOptions: { value: FarmerType; label: string }[] = [
  { value: 'individual', label: 'Pequeno Agricultor' },
  { value: 'family', label: 'Agricultura Familiar' },
  { value: 'company', label: 'Empresa/Grande Produtor' },
];

const cropOptions = [
  'Milho', 'Feijão', 'Mandioca', 'Batata-doce', 'Arroz', 
  'Soja', 'Girassol', 'Amendoim', 'Hortícolas', 'Frutas',
  'Café', 'Banana', 'Cana-de-açúcar', 'Algodão', 'Outros'
];

const irrigationOptions = [
  'Sequeiro', 'Irrigação por gravidade', 'Irrigação por aspersão',
  'Irrigação gota-a-gota', 'Irrigação pivot', 'Misto'
];

export const FarmerForm = ({ farmer, onSubmit, isLoading, defaultCooperativeId, defaultFieldSchoolId }: FarmerFormProps) => {
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(farmer?.province_id || undefined);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | undefined>(farmer?.municipality_id || undefined);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [biDuplicateWarning, setBiDuplicateWarning] = useState<string | null>(null);
  const [checkingBi, setCheckingBi] = useState(false);

  const checkBiDuplicate = useCallback(async (rawBi: string) => {
    const normalized = normalizeBiOrNif(rawBi || '');
    if (!normalized) {
      setBiDuplicateWarning(null);
      return;
    }
    setCheckingBi(true);
    try {
      const { data } = await supabase
        .from('farmers')
        .select('id, name')
        .eq('bi_nif', normalized)
        .neq('id', farmer?.id || '00000000-0000-0000-0000-000000000000')
        .limit(1);
      if (data && data.length > 0) {
        setBiDuplicateWarning(`BI/NIF já registado para: ${data[0].name}`);
      } else {
        setBiDuplicateWarning(null);
      }
    } catch {
      setBiDuplicateWarning(null);
    } finally {
      setCheckingBi(false);
    }
  }, [farmer?.id]);

  const { data: provinces } = useProvinces();
  const { data: municipalities } = useMunicipalities(selectedProvince);
  const { data: communes } = useCommunes(selectedMunicipality);
  const { data: cooperatives } = useFarmers({ type: 'cooperative' });
  const { data: fieldSchools } = useFarmers({ type: 'field_school' });

  // Determine if we're adding a member to an organization
  const isAddingMember = !!defaultCooperativeId || !!defaultFieldSchoolId;

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      // When adding a member, default to individual farmer type
      farmer_type: isAddingMember ? 'individual' : (farmer?.farmer_type || 'individual'),
      name: farmer?.name || '',
      trade_name: farmer?.trade_name || '',
      bi_nif: farmer?.bi_nif ? normalizeBiOrNif(farmer.bi_nif) : '',
      phone: farmer?.phone || '',
      email: farmer?.email || '',
      province_id: farmer?.province_id || undefined,
      municipality_id: farmer?.municipality_id || undefined,
      commune_id: farmer?.commune_id || undefined,
      village: farmer?.village || '',
      address: farmer?.address || '',
      latitude: farmer?.latitude || undefined,
      longitude: farmer?.longitude || undefined,
      total_area_ha: farmer?.total_area_ha || undefined,
      cultivated_area_ha: farmer?.cultivated_area_ha || undefined,
      main_crops: farmer?.main_crops || [],
      irrigation_type: farmer?.irrigation_type || '',
      activity_category: ((farmer as any)?.activity_category as ActivityCategory) || 'agricultural',
      pfnl_products: (farmer as any)?.pfnl_products || [],
      pfnl_collection_area_ha: (farmer as any)?.pfnl_collection_area_ha ?? undefined,
      pfnl_target_species: (farmer as any)?.pfnl_target_species || [],
      pfnl_seasonality: (farmer as any)?.pfnl_seasonality || '',
      pfnl_forest_authorization_ref: (farmer as any)?.pfnl_forest_authorization_ref || '',
      parent_cooperative_id: defaultCooperativeId || farmer?.parent_cooperative_id || undefined,
      field_school_id: defaultFieldSchoolId || farmer?.field_school_id || undefined,
      photo_url: (farmer as any)?.photo_url || undefined,
      fingerprint_data: (farmer as any)?.fingerprint_data || undefined,
      document_bi_url: (farmer as any)?.document_bi_url || undefined,
      document_other_url: (farmer as any)?.document_other_url || undefined,
      document_license_url: (farmer as any)?.document_license_url || undefined,
      document_nif_url: (farmer as any)?.document_nif_url || undefined,
      // Household fields
      household_members_count: (farmer as any)?.household_members_count || undefined,
      dependents_count: (farmer as any)?.dependents_count || undefined,
      spouse_name: (farmer as any)?.spouse_name || '',
      spouse_bi_nif: (farmer as any)?.spouse_bi_nif ? normalizeBiOrNif((farmer as any).spouse_bi_nif) : '',
      children_count: (farmer as any)?.children_count || undefined,
      children_under_5: (farmer as any)?.children_under_5 || undefined,
      children_5_to_14: (farmer as any)?.children_5_to_14 || undefined,
      children_15_to_18: (farmer as any)?.children_15_to_18 || undefined,
      family_workers_count: (farmer as any)?.family_workers_count || undefined,
      head_of_household: (farmer as any)?.head_of_household ?? true,
      household_notes: (farmer as any)?.household_notes || '',
    },
  });

  const farmerType = form.watch('farmer_type');

  useEffect(() => {
    if (farmer?.province_id) {
      setSelectedProvince(farmer.province_id);
    }
    if (farmer?.municipality_id) {
      setSelectedMunicipality(farmer.municipality_id);
    }
  }, [farmer]);

  const handleSubmit = (data: FarmerFormData) => {
    if (biDuplicateWarning) {
      toast.error('Não é possível submeter: BI/NIF duplicado detectado.');
      return;
    }
    const cleanedData: FarmerFormSubmitData = {
      ...data,
      email: data.email === '' ? null : data.email,
      memberIds: (farmerType === 'cooperative' || farmerType === 'field_school') 
        ? selectedMembers 
        : undefined,
    };
    onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className={`grid w-full ${farmerType === 'individual' ? 'grid-cols-6' : (farmerType === 'family' || farmerType === 'company') ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dados Básicos</span>
            </TabsTrigger>
            {farmerType === 'individual' && (
              <TabsTrigger value="household" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Agregado</span>
              </TabsTrigger>
            )}
            {(farmerType === 'individual' || farmerType === 'family' || farmerType === 'company') && (
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Localização</span>
            </TabsTrigger>
            <TabsTrigger value="agriculture" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Agricultura</span>
            </TabsTrigger>
            <TabsTrigger value="associations" className="flex items-center gap-2">
              {(farmerType === 'cooperative' || farmerType === 'field_school') ? (
                <Users className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {(farmerType === 'cooperative' || farmerType === 'field_school') ? 'Membros' : 'Vínculos'}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="farmer_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Registo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {farmerTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {farmerType === 'company' || farmerType === 'cooperative' 
                            ? 'Razão Social *' 
                            : 'Nome Completo *'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Digite o nome" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trade_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Comercial / Fantasia</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="Nome comercial" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="bi_nif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {farmerType === 'company' || farmerType === 'cooperative' 
                            ? 'NIF' 
                            : 'BI / NIF'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            placeholder={
                              farmerType === 'company' || farmerType === 'cooperative'
                                ? 'Ex.: 5417654321 (10 dígitos)'
                                : 'Ex.: 004567890LA041 ou 5417654321'
                            }
                            maxLength={20}
                            onBlur={(e) => {
                              const normalized = normalizeBiOrNif(e.target.value);
                              if (normalized && normalized !== e.target.value) {
                                field.onChange(normalized);
                              }
                              field.onBlur();
                              checkBiDuplicate(e.target.value);
                            }}
                          />
                        </FormControl>
                        {checkingBi && <p className="text-xs text-muted-foreground">A verificar duplicados…</p>}
                        {biDuplicateWarning && (
                          <p className="text-xs text-destructive font-medium">{biDuplicateWarning}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Telefone móvel</FormLabel>
                        <FormControl>
                          <PhoneInputAO
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <EmailInput
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="nome@exemplo.com"
                            invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Household tab - only for individual farmers */}
          {farmerType === 'individual' && (
            <TabsContent value="household">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Agregado Familiar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="head_of_household"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Chefe de Família</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Este agricultor é o chefe do agregado familiar?
                            </p>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value ?? true}
                              onChange={field.onChange}
                              className="h-5 w-5 accent-primary"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="household_members_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total de Membros do Agregado</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="Número total de pessoas"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Cônjuge / Companheiro(a)</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="spouse_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Cônjuge</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} placeholder="Nome completo" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="spouse_bi_nif"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>BI / NIF do Cônjuge</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} placeholder="Número de identificação" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Filhos</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="children_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total de Filhos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="children_under_5"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Menores de 5 anos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="children_5_to_14"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entre 5 e 14 anos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="children_15_to_18"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entre 15 e 18 anos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Dependentes e Trabalhadores</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="dependents_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Dependentes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Pessoas que não trabalham"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Membros do agregado que dependem financeiramente do agricultor
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="family_workers_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trabalhadores Familiares</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Membros que trabalham na exploração"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Membros da família que ajudam nas actividades agrícolas
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <FormField
                      control={form.control}
                      name="household_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações sobre o Agregado</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              value={field.value || ''}
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Informações adicionais sobre a composição familiar, condições especiais, etc."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(farmerType === 'individual' || farmerType === 'family') && (
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Foto, Biometria e Documentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <FormField
                        control={form.control}
                        name="photo_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Foto do Agricultor *</FormLabel>
                            <FormControl>
                              <PhotoUpload
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="fingerprint_data"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <FingerprintCapture
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="document_bi_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DocumentUpload
                              label="Cópia do Bilhete de Identidade"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="document_other_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DocumentUpload
                              label="Outros Documentos (Comprovativo de Residência, etc.)"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Sobre o Cartão do Agricultor
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Após a validação do registo, será gerado automaticamente o Cartão do Agricultor 
                      com QR Code para verificação. O cartão inclui a foto, dados de identificação e 
                      código único de registo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Documents tab - for company/large producers */}
          {farmerType === 'company' && (
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="document_license_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DocumentUpload
                              label="Alvará / Licença Comercial"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="document_nif_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DocumentUpload
                              label="Certificado de NIF"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="document_bi_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DocumentUpload
                              label="Estatutos / Contrato Social"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="document_other_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DocumentUpload
                              label="Outros Documentos (Registo Comercial, etc.)"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Award className="h-4 w-4" />
                      Sobre o Certificado de Produtor
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Após a validação do registo, será emitido o Certificado de Produtor Registado 
                      pelo Ministério da Agricultura e Pescas. O certificado inclui QR Code para 
                      verificação de autenticidade e poderá ser utilizado para fins comerciais e legais.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Localização Geográfica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="province_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedProvince(value);
                            form.setValue('municipality_id', undefined);
                            form.setValue('commune_id', undefined);
                          }} 
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a província" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces?.map((province) => (
                              <SelectItem key={province.id} value={province.id}>
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="municipality_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedMunicipality(value);
                            form.setValue('commune_id', undefined);
                          }} 
                          defaultValue={field.value || undefined}
                          disabled={!selectedProvince}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o município" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {municipalities?.map((municipality) => (
                              <SelectItem key={municipality.id} value={municipality.id}>
                                {municipality.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="commune_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || undefined}
                          disabled={!selectedMunicipality}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a comuna" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {communes?.map((commune) => (
                              <SelectItem key={commune.id} value={commune.id}>
                                {commune.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aldeia / Localidade</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="Nome da aldeia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço / Referência</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="Endereço ou referência" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any"
                            value={field.value ?? ''} 
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="-12.3456" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            step="any"
                            value={field.value ?? ''} 
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="17.8765" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agriculture">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Produtiva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="activity_category"
                  render={({ field }) => {
                    const value = (field.value as ActivityCategory) || 'agricultural';
                    return (
                      <FormItem>
                        <FormLabel>Categoria de Atividade</FormLabel>
                        <div className="grid gap-2 md:grid-cols-3">
                          {ACTIVITY_CATEGORIES.map((opt) => {
                            const active = value === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => field.onChange(opt.value)}
                                className={`text-left rounded-lg border p-3 transition ${
                                  active
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                                }`}
                              >
                                <div className="font-medium text-sm">{opt.label}</div>
                                <div className="text-xs text-muted-foreground mt-1">{opt.description}</div>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {(() => {
                  const cat = (form.watch('activity_category') as ActivityCategory) || 'agricultural';
                  const showAgri = cat === 'agricultural' || cat === 'mixed';
                  const showPfnl = cat === 'pfnl' || cat === 'mixed';
                  return (
                    <>
                      {showAgri && (
                        <div className="space-y-4 rounded-lg border bg-card p-4">
                          <h4 className="font-semibold text-sm">Dados Agrícolas</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="total_area_ha"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Área Total (hectares)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      value={field.value ?? ''}
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="cultivated_area_ha"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Área Cultivada (hectares)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      value={field.value ?? ''}
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="irrigation_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Irrigação</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo de irrigação" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {irrigationOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="main_crops"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Culturas Principais</FormLabel>
                                <div className="flex flex-wrap gap-2">
                                  {cropOptions.map((crop) => (
                                    <Button
                                      key={crop}
                                      type="button"
                                      variant={field.value?.includes(crop) ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => {
                                        const current = field.value || [];
                                        if (current.includes(crop)) {
                                          field.onChange(current.filter((c) => c !== crop));
                                        } else {
                                          field.onChange([...current, crop]);
                                        }
                                      }}
                                    >
                                      {crop}
                                    </Button>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {showPfnl && (
                        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                          <div>
                            <h4 className="font-semibold text-sm">Produtos Florestais Não-Lenhosos (PFNL)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Recolha sustentável em florestas e savanas (mel silvestre, plantas medicinais, frutos, resinas…).
                            </p>
                          </div>

                          <FormField
                            control={form.control}
                            name="pfnl_products"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Produtos PFNL recolhidos <span className="text-destructive">*</span></FormLabel>
                                <div className="flex flex-wrap gap-2">
                                  {PFNL_PRODUCTS.map((p) => (
                                    <Button
                                      key={p}
                                      type="button"
                                      variant={field.value?.includes(p) ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => {
                                        const current = field.value || [];
                                        if (current.includes(p)) {
                                          field.onChange(current.filter((c: string) => c !== p));
                                        } else {
                                          field.onChange([...current, p]);
                                        }
                                      }}
                                    >
                                      {p}
                                    </Button>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="pfnl_collection_area_ha"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Área / Zona de Coleta (hectares) <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      value={field.value ?? ''}
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pfnl_forest_authorization_ref"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ref.ª Autorização Florestal <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ''}
                                      placeholder="Ex.: LEX-2026-000123"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="pfnl_target_species"
                            render={({ field }) => {
                              const value: string[] = Array.isArray(field.value) ? field.value : [];
                              return (
                                <FormItem>
                                  <FormLabel>Espécies-alvo <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Separe por vírgula (ex.: Adansonia digitata, Brachystegia spp.)"
                                      value={value.join(', ')}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value
                                            .split(',')
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          <FormField
                            control={form.control}
                            name="pfnl_seasonality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sazonalidade</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    value={field.value ?? ''}
                                    placeholder="Ex.: Mel — Maio a Setembro; Múcua — Junho a Agosto"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="associations">
            <Card>
              <CardHeader>
                <CardTitle>
                  {(farmerType === 'cooperative' || farmerType === 'field_school') 
                    ? 'Membros' 
                    : 'Vínculos Institucionais'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(farmerType === 'individual' || farmerType === 'family') && (
                  <>
                    <FormField
                      control={form.control}
                      name="parent_cooperative_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cooperativa Associada</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a cooperativa (opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cooperatives?.map((coop) => (
                                <SelectItem key={coop.id} value={coop.id}>
                                  {coop.name} ({coop.registration_number})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="field_school_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escola de Campo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a escola de campo (opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fieldSchools?.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name} ({school.registration_number})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {farmerType === 'cooperative' && (
                  <MemberSelector
                    organizationId={farmer?.id}
                    organizationType="cooperative"
                    selectedMembers={selectedMembers}
                    onMembersChange={setSelectedMembers}
                  />
                )}

                {farmerType === 'field_school' && (
                  <MemberSelector
                    organizationId={farmer?.id}
                    organizationType="field_school"
                    selectedMembers={selectedMembers}
                    onMembersChange={setSelectedMembers}
                  />
                )}

                {farmerType === 'company' && (
                  <p className="text-sm text-muted-foreground">
                    Empresas não possuem vínculos institucionais associados.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'A guardar...' : farmer ? 'Atualizar Registo' : 'Criar Registo'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
