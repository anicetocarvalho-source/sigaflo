import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  TreePine, 
  Flame, 
  Package, 
  Leaf,
  FileText,
  ClipboardCheck,
  CheckCircle,
  Send,
  Upload,
  MapPin,
  User,
  Building,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useForestOperators, useCreateLicense, type ForestLicense } from '@/hooks/useForestry';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Product types
const productTypes = [
  {
    id: 'timber_log',
    label: 'Madeira em Toro',
    description: 'Exploração e comercialização de madeira em toros',
    icon: TreePine,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-500',
  },
  {
    id: 'firewood',
    label: 'Lenha',
    description: 'Colecta e venda de lenha para uso doméstico ou industrial',
    icon: Flame,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
  },
  {
    id: 'charcoal',
    label: 'Carvão Vegetal',
    description: 'Produção e comercialização de carvão vegetal',
    icon: Package,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    borderColor: 'border-gray-500',
  },
  {
    id: 'non_timber',
    label: 'Produtos Não Lenhosos',
    description: 'Mel, resinas, frutos, plantas medicinais, cogumelos, etc.',
    icon: Leaf,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
  },
];

// Workflow steps
const workflowSteps = [
  { id: 'draft', label: 'Rascunho', icon: FileText },
  { id: 'submitted', label: 'Submetido', icon: Send },
  { id: 'under_review', label: 'Avaliação', icon: ClipboardCheck },
  { id: 'approved', label: 'Aprovado', icon: CheckCircle },
];

const formSchema = z.object({
  product_type: z.enum(['timber_log', 'firewood', 'charcoal', 'non_timber']),
  operator_id: z.string().min(1, 'Operador é obrigatório'),
  applicant_name: z.string().min(1, 'Nome do requerente é obrigatório'),
  applicant_bi: z.string().optional(),
  applicant_phone: z.string().optional(),
  applicant_email: z.string().email().optional().or(z.literal('')),
  concession_area_name: z.string().min(1, 'Nome da área é obrigatório'),
  concession_area_ha: z.coerce.number().min(0.1, 'Área deve ser maior que 0'),
  province_id: z.string().min(1, 'Província é obrigatória'),
  municipality_id: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  authorized_species: z.string().optional(),
  authorized_volume_m3: z.coerce.number().optional(),
  requested_duration_months: z.coerce.number().min(1, 'Duração mínima de 1 mês').max(60, 'Duração máxima de 60 meses'),
  purpose: z.string().min(10, 'Descreva o propósito com mais detalhe'),
  environmental_assessment: z.string().optional(),
  community_consent: z.boolean().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LicenseRequestFormProps {
  open: boolean;
  onClose: () => void;
  license?: ForestLicense | null;
}

export function LicenseRequestForm({ open, onClose, license }: LicenseRequestFormProps) {
  const [step, setStep] = useState(1);
  const [selectedProductType, setSelectedProductType] = useState<string>('timber_log');
  
  const { data: operators } = useForestOperators();
  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase.from('provinces').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedProvinceId = useForm<FormData>().watch?.('province_id');
  const { data: municipalities } = useQuery({
    queryKey: ['municipalities', selectedProvinceId],
    queryFn: async () => {
      if (!selectedProvinceId) return [];
      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .eq('province_id', selectedProvinceId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProvinceId,
  });

  const createLicense = useCreateLicense();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_type: 'timber_log',
      operator_id: '',
      applicant_name: '',
      applicant_bi: '',
      applicant_phone: '',
      applicant_email: '',
      concession_area_name: '',
      concession_area_ha: undefined,
      province_id: '',
      municipality_id: '',
      latitude: undefined,
      longitude: undefined,
      authorized_species: '',
      authorized_volume_m3: undefined,
      requested_duration_months: 12,
      purpose: '',
      environmental_assessment: '',
      community_consent: false,
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      setStep(1);
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: FormData) => {
    // Map product_type to license_type for the database
    const licenseTypeMap: Record<string, 'exploitation' | 'transport' | 'export' | 'sawmill' | 'processing'> = {
      timber_log: 'exploitation',
      firewood: 'exploitation',
      charcoal: 'processing',
      non_timber: 'exploitation',
    };

    const payload = {
      license_type: licenseTypeMap[data.product_type],
      operator_id: data.operator_id,
      concession_area_name: data.concession_area_name,
      concession_area_ha: data.concession_area_ha,
      province_id: data.province_id || null,
      municipality_id: data.municipality_id || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      authorized_species: data.authorized_species
        ? data.authorized_species.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      authorized_volume_m3: data.authorized_volume_m3 || null,
      notes: `Tipo de Produto: ${productTypes.find(p => p.id === data.product_type)?.label}\n\nRequerente: ${data.applicant_name}\nBI/NIF: ${data.applicant_bi || 'N/A'}\nTelefone: ${data.applicant_phone || 'N/A'}\nEmail: ${data.applicant_email || 'N/A'}\n\nPropósito: ${data.purpose}\n\nDuração Solicitada: ${data.requested_duration_months} meses\n\n${data.notes || ''}`,
      status: 'submitted' as const,
      license_number: '', // Auto-generated by trigger
    };

    await createLicense.mutateAsync(payload as any);
    onClose();
  };

  const isLoading = createLicense.isPending;
  const productType = productTypes.find(p => p.id === selectedProductType);

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedProductType;
      case 2:
        return form.watch('operator_id') && form.watch('applicant_name');
      case 3:
        return form.watch('concession_area_name') && form.watch('province_id') && form.watch('concession_area_ha');
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <TreePine className="h-6 w-6 text-emerald-600" />
            Pedido de Licença Florestal
          </DialogTitle>
          <DialogDescription>
            Submeta um pedido de licença para exploração de recursos florestais
          </DialogDescription>
        </DialogHeader>

        {/* Workflow Progress */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            {workflowSteps.slice(0, 4).map((ws, index) => {
              const isActive = index + 1 === step;
              const isCompleted = index + 1 < step;
              const Icon = ws.icon;
              
              return (
                <div key={ws.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                        !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      'mt-2 text-xs font-medium',
                      isActive && 'text-primary',
                      isCompleted && 'text-emerald-600',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}>
                      {ws.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2',
                      isCompleted ? 'bg-emerald-500' : 'bg-muted'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Select Product Type */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Seleccione o Tipo de Produto</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {productTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedProductType === type.id;
                    
                    return (
                      <Card
                        key={type.id}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          isSelected && `ring-2 ${type.borderColor}`
                        )}
                        onClick={() => {
                          setSelectedProductType(type.id);
                          form.setValue('product_type', type.id as any);
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', type.bgColor)}>
                              <Icon className={cn('h-6 w-6', type.color)} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{type.label}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                            </div>
                            {isSelected && (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Seleccionado
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Applicant Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', productType?.bgColor)}>
                    {productType && <productType.icon className={cn('h-5 w-5', productType.color)} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Informação do Requerente</h3>
                    <p className="text-sm text-muted-foreground">Dados do operador e contacto</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Operador Florestal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="operator_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operador Registado *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione o operador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {operators?.map((op) => (
                                <SelectItem key={op.id} value={op.id}>
                                  {op.name} ({op.nif})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            O operador deve estar previamente registado no sistema
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dados do Requerente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="applicant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome do requerente" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="applicant_bi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>BI / NIF</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Número do documento" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="applicant_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+244 9XX XXX XXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="applicant_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="email@exemplo.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Location & Resources */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', productType?.bgColor)}>
                    {productType && <productType.icon className={cn('h-5 w-5', productType.color)} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Localização e Recursos</h3>
                    <p className="text-sm text-muted-foreground">Área de exploração e especificações</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Área de Exploração
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="concession_area_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Área / Concessão *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Floresta do Mayombe - Sector Norte" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="province_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Província *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {provinces?.map((prov) => (
                                  <SelectItem key={prov.id} value={prov.id}>
                                    {prov.name}
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
                        name="concession_area_ha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área Total (hectares) *</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.1" placeholder="0.0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.000001" placeholder="-12.345678" />
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
                              <Input {...field} type="number" step="0.000001" placeholder="13.456789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TreePine className="h-4 w-4" />
                      Recursos Solicitados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(selectedProductType === 'timber_log' || selectedProductType === 'firewood') && (
                      <>
                        <FormField
                          control={form.control}
                          name="authorized_species"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Espécies a Explorar</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Separadas por vírgula: Pau-ferro, Mukula, Tola" />
                              </FormControl>
                              <FormDescription>
                                Liste as espécies de madeira que pretende explorar
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="authorized_volume_m3"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Volume Solicitado (m³)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="0" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {selectedProductType === 'charcoal' && (
                      <FormField
                        control={form.control}
                        name="authorized_volume_m3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade Estimada (toneladas)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" />
                            </FormControl>
                            <FormDescription>
                              Estimativa de produção anual de carvão vegetal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedProductType === 'non_timber' && (
                      <FormField
                        control={form.control}
                        name="authorized_species"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produtos a Colectar</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Mel, Resinas, Cogumelos, Plantas medicinais" />
                            </FormControl>
                            <FormDescription>
                              Liste os produtos florestais não lenhosos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="requested_duration_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração da Licença (meses) *</FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="6">6 meses</SelectItem>
                              <SelectItem value="12">12 meses (1 ano)</SelectItem>
                              <SelectItem value="24">24 meses (2 anos)</SelectItem>
                              <SelectItem value="36">36 meses (3 anos)</SelectItem>
                              <SelectItem value="60">60 meses (5 anos)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Purpose & Submission */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', productType?.bgColor)}>
                    {productType && <productType.icon className={cn('h-5 w-5', productType.color)} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Finalização do Pedido</h3>
                    <p className="text-sm text-muted-foreground">Propósito e documentação</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Propósito da Actividade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Propósito *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={4} 
                              placeholder="Descreva o propósito da exploração florestal, incluindo a finalidade comercial ou industrial, mercados alvo, e benefícios esperados para a comunidade local..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="environmental_assessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avaliação Ambiental</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={3} 
                              placeholder="Referência a estudos de impacto ambiental, medidas de mitigação, plano de reflorestamento..."
                            />
                          </FormControl>
                          <FormDescription>
                            Se aplicável, indique referências a estudos de impacto ambiental
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações Adicionais</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} placeholder="Outras informações relevantes..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo de Produto:</span>
                        <p className="font-medium">{productType?.label}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Área:</span>
                        <p className="font-medium">{form.watch('concession_area_name') || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requerente:</span>
                        <p className="font-medium">{form.watch('applicant_name') || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duração:</span>
                        <p className="font-medium">{form.watch('requested_duration_months') || 12} meses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <Upload className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Após submissão, poderá anexar documentos de suporte através do portal.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? onClose : prevStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {step === 1 ? 'Cancelar' : 'Anterior'}
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Submeter Pedido
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
