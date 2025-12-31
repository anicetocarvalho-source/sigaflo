import { useState, useEffect } from 'react';
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
import { MapPin, User, Leaf, Building2, Users, FileText, Camera, Award } from 'lucide-react';
import { useProvinces, useMunicipalities, useCommunes, useFarmers } from '@/hooks/useFarmers';
import type { Farmer, FarmerType } from '@/hooks/useFarmers';
import { MemberSelector } from './MemberSelector';
import { PhotoUpload } from './PhotoUpload';
import { DocumentUpload } from './DocumentUpload';
import { FingerprintCapture } from './FingerprintCapture';

const farmerSchema = z.object({
  farmer_type: z.enum(['individual', 'family', 'cooperative', 'field_school', 'company']),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  trade_name: z.string().max(100).optional().nullable(),
  bi_nif: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').max(100).optional().nullable().or(z.literal('')),
  province_id: z.string().uuid().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  commune_id: z.string().uuid().optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  total_area_ha: z.number().min(0).optional().nullable(),
  cultivated_area_ha: z.number().min(0).optional().nullable(),
  main_crops: z.array(z.string()).optional().nullable(),
  irrigation_type: z.string().max(50).optional().nullable(),
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
});

type FarmerFormData = z.infer<typeof farmerSchema>;

export interface FarmerFormSubmitData extends FarmerFormData {
  memberIds?: string[];
}

interface FarmerFormProps {
  farmer?: Farmer | null;
  onSubmit: (data: FarmerFormSubmitData) => void;
  isLoading?: boolean;
}

const farmerTypeOptions: { value: FarmerType; label: string }[] = [
  { value: 'individual', label: 'Pequeno Agricultor' },
  { value: 'family', label: 'Agricultura Familiar' },
  { value: 'cooperative', label: 'Cooperativa' },
  { value: 'field_school', label: 'Escola de Campo' },
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

export const FarmerForm = ({ farmer, onSubmit, isLoading }: FarmerFormProps) => {
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(farmer?.province_id || undefined);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | undefined>(farmer?.municipality_id || undefined);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { data: provinces } = useProvinces();
  const { data: municipalities } = useMunicipalities(selectedProvince);
  const { data: communes } = useCommunes(selectedMunicipality);
  const { data: cooperatives } = useFarmers({ type: 'cooperative' });
  const { data: fieldSchools } = useFarmers({ type: 'field_school' });

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      farmer_type: farmer?.farmer_type || 'individual',
      name: farmer?.name || '',
      trade_name: farmer?.trade_name || '',
      bi_nif: farmer?.bi_nif || '',
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
      parent_cooperative_id: farmer?.parent_cooperative_id || undefined,
      field_school_id: farmer?.field_school_id || undefined,
      photo_url: (farmer as any)?.photo_url || undefined,
      fingerprint_data: (farmer as any)?.fingerprint_data || undefined,
      document_bi_url: (farmer as any)?.document_bi_url || undefined,
      document_other_url: (farmer as any)?.document_other_url || undefined,
      document_license_url: (farmer as any)?.document_license_url || undefined,
      document_nif_url: (farmer as any)?.document_nif_url || undefined,
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
          <TabsList className={`grid w-full ${(farmerType === 'individual' || farmerType === 'family' || farmerType === 'company') ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dados Básicos</span>
            </TabsTrigger>
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
                          <Input {...field} value={field.value || ''} placeholder="Número de identificação" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="+244 9XX XXX XXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} type="email" placeholder="email@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents tab - for individual, family, and company */}
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
                <CardTitle>Dados Agrícolas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
