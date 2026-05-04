import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { optionalEmailSchema, optionalPhoneAOSchema } from '@/lib/validation';
import { PhoneInputAO } from '@/components/ui/phone-input-ao';
import { EmailInput } from '@/components/ui/email-input';
import { Building2, FileText, Users, MapPin, Leaf, Briefcase } from 'lucide-react';
import { useProvinces, useMunicipalities, useCommunes } from '@/hooks/useFarmers';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUpload } from './DocumentUpload';
import { MemberSelector } from './MemberSelector';
import { toast } from 'sonner';
import type { Farmer } from '@/hooks/useFarmers';
import type { CooperativeDetails } from '@/hooks/useCooperative';

const schema = z.object({
  // base
  name: z.string().min(3, 'Razão social obrigatória').max(150),
  trade_name: z.string().max(100).optional().nullable(),
  bi_nif: z.string().max(20).optional().nullable(),
  phone: optionalPhoneAOSchema,
  email: optionalEmailSchema,
  province_id: z.string().uuid().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  commune_id: z.string().uuid().optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  cultivated_area_ha: z.number().min(0).optional().nullable(),
  main_crops: z.array(z.string()).optional().nullable(),
  // details
  nif: z.string().max(20).optional().nullable(),
  legal_constitution_date: z.string().optional().nullable(),
  dncm_registration_number: z.string().max(50).optional().nullable(),
  license_url: z.string().optional().nullable(),
  statutes_url: z.string().optional().nullable(),
  president_name: z.string().max(100).optional().nullable(),
  president_phone: optionalPhoneAOSchema,
  secretary_name: z.string().max(100).optional().nullable(),
  treasurer_name: z.string().max(100).optional().nullable(),
  degree: z.enum(['first_degree', 'second_degree']).optional().nullable(),
  total_members: z.number().int().min(0).optional().nullable(),
  share_capital_aoa: z.number().min(0).optional().nullable(),
  minimum_quota_aoa: z.number().min(0).optional().nullable(),
  aggregated_area_ha: z.number().min(0).optional().nullable(),
  infrastructures: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CooperativeFormData = z.infer<typeof schema>;

export interface CooperativeFormSubmitData {
  base: Partial<Farmer>;
  details: Partial<CooperativeDetails>;
  memberIds?: string[];
}

interface Props {
  farmer?: Farmer | null;
  details?: CooperativeDetails | null;
  onSubmit: (data: CooperativeFormSubmitData) => void;
  isLoading?: boolean;
}

const cropOptions = ['Milho', 'Feijão', 'Mandioca', 'Arroz', 'Café', 'Hortícolas', 'Frutas', 'Soja', 'Outros'];
const infraOptions = ['Armazém', 'Silo', 'Unidade de processamento', 'Câmara fria', 'Tractor', 'Sistema de irrigação', 'Escritório'];

export const CooperativeForm = ({ farmer, details, onSubmit, isLoading }: Props) => {
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(farmer?.province_id);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | undefined>(farmer?.municipality_id);
  const [members, setMembers] = useState<string[]>([]);
  const [nifWarning, setNifWarning] = useState<string | null>(null);

  const { data: provinces } = useProvinces();
  const { data: municipalities } = useMunicipalities(selectedProvince);
  const { data: communes } = useCommunes(selectedMunicipality);

  const form = useForm<CooperativeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
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
      latitude: farmer?.latitude ?? undefined,
      longitude: farmer?.longitude ?? undefined,
      cultivated_area_ha: farmer?.cultivated_area_ha ?? undefined,
      main_crops: farmer?.main_crops || [],
      nif: details?.nif || '',
      legal_constitution_date: details?.legal_constitution_date || '',
      dncm_registration_number: details?.dncm_registration_number || '',
      license_url: details?.license_url || '',
      statutes_url: details?.statutes_url || '',
      president_name: details?.president_name || '',
      president_phone: details?.president_phone || '',
      secretary_name: details?.secretary_name || '',
      treasurer_name: details?.treasurer_name || '',
      degree: details?.degree ?? undefined,
      total_members: details?.total_members ?? undefined,
      share_capital_aoa: details?.share_capital_aoa ?? undefined,
      minimum_quota_aoa: details?.minimum_quota_aoa ?? undefined,
      aggregated_area_ha: details?.aggregated_area_ha ?? undefined,
      infrastructures: details?.infrastructures || [],
      notes: details?.notes || '',
    },
  });

  useEffect(() => {
    if (farmer?.province_id) setSelectedProvince(farmer.province_id);
    if (farmer?.municipality_id) setSelectedMunicipality(farmer.municipality_id);
  }, [farmer]);

  const checkNifDup = useCallback(async (nif: string) => {
    if (!nif || nif.length < 5) { setNifWarning(null); return; }
    const { data } = await supabase.from('farmers').select('id, name')
      .eq('bi_nif', nif).neq('id', farmer?.id || '00000000-0000-0000-0000-000000000000').limit(1);
    setNifWarning(data && data.length > 0 ? `NIF já registado para: ${data[0].name}` : null);
  }, [farmer?.id]);

  const handle = (data: CooperativeFormData) => {
    if (nifWarning) { toast.error('NIF duplicado detectado'); return; }
    const { name, trade_name, bi_nif, phone, email, province_id, municipality_id, commune_id,
      village, address, latitude, longitude, cultivated_area_ha, main_crops, ...details } = data;
    onSubmit({
      base: {
        name, trade_name, bi_nif: bi_nif || details.nif || null, phone, email: email || null,
        province_id, municipality_id, commune_id, village, address,
        latitude, longitude, cultivated_area_ha, main_crops,
      },
      details,
      memberIds: members,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="space-y-6">
        <Tabs defaultValue="ident" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ident"><Building2 className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Identificação</span></TabsTrigger>
            <TabsTrigger value="legal"><FileText className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Jurídico</span></TabsTrigger>
            <TabsTrigger value="board"><Briefcase className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Órgãos</span></TabsTrigger>
            <TabsTrigger value="loc"><MapPin className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Localização</span></TabsTrigger>
            <TabsTrigger value="activity"><Leaf className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Atividade</span></TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Membros</span></TabsTrigger>
          </TabsList>

          <TabsContent value="ident">
            <Card><CardHeader><CardTitle>Identificação da Cooperativa</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Razão Social *</FormLabel><FormControl><Input {...field} placeholder="Cooperativa Agrícola..." /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="trade_name" render={({ field }) => (
                  <FormItem><FormLabel>Nome Comercial</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField control={form.control} name="phone" render={({ field, fieldState }) => (
                  <FormItem><FormLabel>Telefone móvel</FormLabel><FormControl>
                    <PhoneInputAO value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} invalid={!!fieldState.error} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field, fieldState }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl>
                    <EmailInput value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} placeholder="nome@exemplo.com" invalid={!!fieldState.error} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bi_nif" render={({ field }) => (
                  <FormItem><FormLabel>BI/NIF (contacto)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="legal">
            <Card><CardHeader><CardTitle>Dados Jurídicos</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField control={form.control} name="nif" render={({ field }) => (
                  <FormItem><FormLabel>NIF da Cooperativa</FormLabel><FormControl>
                    <Input {...field} value={field.value || ''} onBlur={(e) => { field.onBlur(); checkNifDup(e.target.value); }} />
                  </FormControl>
                  {nifWarning && <p className="text-xs text-destructive">{nifWarning}</p>}
                  <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="legal_constitution_date" render={({ field }) => (
                  <FormItem><FormLabel>Data de Constituição</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dncm_registration_number" render={({ field }) => (
                  <FormItem><FormLabel>Nº Registo DNCM/IFAP</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="license_url" render={({ field }) => (
                  <FormItem><FormControl><DocumentUpload label="Alvará / Licença" value={field.value} onChange={field.onChange} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="statutes_url" render={({ field }) => (
                  <FormItem><FormControl><DocumentUpload label="Estatutos / Acta de Constituição" value={field.value} onChange={field.onChange} /></FormControl></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="board">
            <Card><CardHeader><CardTitle>Órgãos Sociais e Estrutura</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="president_name" render={({ field }) => (
                  <FormItem><FormLabel>Presidente</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="president_phone" render={({ field, fieldState }) => (
                  <FormItem><FormLabel>Telefone do Presidente</FormLabel><FormControl>
                    <PhoneInputAO value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} invalid={!!fieldState.error} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="secretary_name" render={({ field }) => (
                  <FormItem><FormLabel>Secretário</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="treasurer_name" render={({ field }) => (
                  <FormItem><FormLabel>Tesoureiro</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField control={form.control} name="degree" render={({ field }) => (
                  <FormItem><FormLabel>Grau</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="first_degree">1º Grau (de base)</SelectItem>
                        <SelectItem value="second_degree">2º Grau (união)</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="total_members" render={({ field }) => (
                  <FormItem><FormLabel>Nº Cooperados</FormLabel><FormControl>
                    <Input type="number" min="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="share_capital_aoa" render={({ field }) => (
                  <FormItem><FormLabel>Capital Social (AOA)</FormLabel><FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="minimum_quota_aoa" render={({ field }) => (
                  <FormItem><FormLabel>Quota Mínima (AOA)</FormLabel><FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="loc">
            <Card><CardHeader><CardTitle>Localização da Sede</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField control={form.control} name="province_id" render={({ field }) => (
                  <FormItem><FormLabel>Província</FormLabel>
                    <Select onValueChange={(v) => { field.onChange(v); setSelectedProvince(v); form.setValue('municipality_id', undefined); form.setValue('commune_id', undefined); }} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{provinces?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="municipality_id" render={({ field }) => (
                  <FormItem><FormLabel>Município</FormLabel>
                    <Select onValueChange={(v) => { field.onChange(v); setSelectedMunicipality(v); form.setValue('commune_id', undefined); }} defaultValue={field.value || undefined} disabled={!selectedProvince}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{municipalities?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="commune_id" render={({ field }) => (
                  <FormItem><FormLabel>Comuna</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined} disabled={!selectedMunicipality}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{communes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="village" render={({ field }) => (
                  <FormItem><FormLabel>Aldeia / Localidade</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Endereço da Sede</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="latitude" render={({ field }) => (
                  <FormItem><FormLabel>Latitude</FormLabel><FormControl>
                    <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  </FormControl></FormItem>
                )} />
                <FormField control={form.control} name="longitude" render={({ field }) => (
                  <FormItem><FormLabel>Longitude</FormLabel><FormControl>
                    <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  </FormControl></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card><CardHeader><CardTitle>Atividade Produtiva Agregada</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="aggregated_area_ha" render={({ field }) => (
                  <FormItem><FormLabel>Área Agregada (ha)</FormLabel><FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
                <FormField control={form.control} name="cultivated_area_ha" render={({ field }) => (
                  <FormItem><FormLabel>Área Cultivada (ha)</FormLabel><FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  </FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="main_crops" render={({ field }) => (
                <FormItem><FormLabel>Culturas Principais</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {cropOptions.map(c => (
                      <Button key={c} type="button" size="sm"
                        variant={field.value?.includes(c) ? 'default' : 'outline'}
                        onClick={() => {
                          const cur = field.value || [];
                          field.onChange(cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                        }}>{c}</Button>
                    ))}
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="infrastructures" render={({ field }) => (
                <FormItem><FormLabel>Infraestruturas Disponíveis</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {infraOptions.map(c => (
                      <Button key={c} type="button" size="sm"
                        variant={field.value?.includes(c) ? 'default' : 'outline'}
                        onClick={() => {
                          const cur = field.value || [];
                          field.onChange(cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                        }}>{c}</Button>
                    ))}
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Observações</FormLabel><FormControl>
                  <Textarea {...field} value={field.value || ''} placeholder="Notas adicionais sobre a cooperativa" />
                </FormControl></FormItem>
              )} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="members">
            <Card><CardHeader><CardTitle>Cooperados</CardTitle></CardHeader><CardContent>
              <MemberSelector
                organizationId={farmer?.id}
                organizationType="cooperative"
                selectedMembers={members}
                onMembersChange={setMembers}
              />
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'A guardar...' : farmer ? 'Atualizar Cooperativa' : 'Criar Cooperativa'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
