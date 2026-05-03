import { useState, useEffect } from 'react';
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
import { GraduationCap, Users, Briefcase, MapPin, Sprout, BookOpen } from 'lucide-react';
import { useProvinces, useMunicipalities, useCommunes } from '@/hooks/useFarmers';
import { MemberSelector } from './MemberSelector';
import type { Farmer } from '@/hooks/useFarmers';
import type { FieldSchoolDetails } from '@/hooks/useFieldSchool';

const schema = z.object({
  name: z.string().min(3, 'Nome obrigatório').max(150),
  trade_name: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').max(100).optional().nullable().or(z.literal('')),
  province_id: z.string().uuid().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  commune_id: z.string().uuid().optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  // pedagógico
  start_date: z.string().optional().nullable(),
  duration_months: z.number().int().min(1).max(36).optional().nullable(),
  curriculum_modules: z.array(z.string()).optional().nullable(),
  focus_crop: z.string().max(50).optional().nullable(),
  // turma
  participants_count: z.number().int().min(0).optional().nullable(),
  participants_male: z.number().int().min(0).optional().nullable(),
  participants_female: z.number().int().min(0).optional().nullable(),
  avg_age_range: z.string().max(20).optional().nullable(),
  avg_education_level: z.string().max(50).optional().nullable(),
  // promotor
  promoter_entity: z.string().max(50).optional().nullable(),
  promoter_name: z.string().max(150).optional().nullable(),
  funding_source: z.string().max(150).optional().nullable(),
  linked_project: z.string().max(150).optional().nullable(),
  // parcela
  demo_parcel_area_ha: z.number().min(0).optional().nullable(),
  demo_crops: z.array(z.string()).optional().nullable(),
  demo_latitude: z.number().min(-90).max(90).optional().nullable(),
  demo_longitude: z.number().min(-180).max(180).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type FieldSchoolFormData = z.infer<typeof schema>;

export interface FieldSchoolFormSubmitData {
  base: Partial<Farmer>;
  details: Partial<FieldSchoolDetails>;
  memberIds?: string[];
}

interface Props {
  farmer?: Farmer | null;
  details?: FieldSchoolDetails | null;
  onSubmit: (data: FieldSchoolFormSubmitData) => void;
  isLoading?: boolean;
}

const moduleOptions = ['Maneio Integrado de Pragas', 'Solo e Fertilidade', 'Sementes Melhoradas', 'Conservação de Água', 'Pós-colheita', 'Comercialização', 'Género e Inclusão'];
const cropOptions = ['Milho', 'Feijão', 'Mandioca', 'Arroz', 'Hortícolas', 'Café', 'Outros'];
const ageRanges = ['18-25', '26-35', '36-45', '46-60', '60+'];
const educationLevels = ['Sem instrução', 'Ensino primário', 'Ensino secundário', 'Ensino superior'];
const promoterEntities = ['IDA', 'ONG', 'Cooperativa', 'MINAGRIP', 'Privado'];

export const FieldSchoolForm = ({ farmer, details, onSubmit, isLoading }: Props) => {
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(farmer?.province_id);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | undefined>(farmer?.municipality_id);
  const [members, setMembers] = useState<string[]>([]);

  const { data: provinces } = useProvinces();
  const { data: municipalities } = useMunicipalities(selectedProvince);
  const { data: communes } = useCommunes(selectedMunicipality);

  const form = useForm<FieldSchoolFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: farmer?.name || '',
      trade_name: farmer?.trade_name || '',
      phone: farmer?.phone || '',
      email: farmer?.email || '',
      province_id: farmer?.province_id || undefined,
      municipality_id: farmer?.municipality_id || undefined,
      commune_id: farmer?.commune_id || undefined,
      village: farmer?.village || '',
      address: farmer?.address || '',
      start_date: details?.start_date || '',
      duration_months: details?.duration_months ?? undefined,
      curriculum_modules: details?.curriculum_modules || [],
      focus_crop: details?.focus_crop || '',
      participants_count: details?.participants_count ?? undefined,
      participants_male: details?.participants_male ?? undefined,
      participants_female: details?.participants_female ?? undefined,
      avg_age_range: details?.avg_age_range || '',
      avg_education_level: details?.avg_education_level || '',
      promoter_entity: details?.promoter_entity || '',
      promoter_name: details?.promoter_name || '',
      funding_source: details?.funding_source || '',
      linked_project: details?.linked_project || '',
      demo_parcel_area_ha: details?.demo_parcel_area_ha ?? undefined,
      demo_crops: details?.demo_crops || [],
      demo_latitude: details?.demo_latitude ?? undefined,
      demo_longitude: details?.demo_longitude ?? undefined,
      notes: details?.notes || '',
    },
  });

  useEffect(() => {
    if (farmer?.province_id) setSelectedProvince(farmer.province_id);
    if (farmer?.municipality_id) setSelectedMunicipality(farmer.municipality_id);
  }, [farmer]);

  const handle = (data: FieldSchoolFormData) => {
    const { name, trade_name, phone, email, province_id, municipality_id, commune_id,
      village, address, ...details } = data;
    onSubmit({
      base: { name, trade_name, phone, email: email || null, province_id, municipality_id, commune_id, village, address },
      details,
      memberIds: members,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="space-y-6">
        <Tabs defaultValue="ident" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ident"><GraduationCap className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Identificação</span></TabsTrigger>
            <TabsTrigger value="promoter"><Briefcase className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Promotor</span></TabsTrigger>
            <TabsTrigger value="pedagogy"><BookOpen className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Pedagógico</span></TabsTrigger>
            <TabsTrigger value="class"><Users className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Turma</span></TabsTrigger>
            <TabsTrigger value="parcel"><Sprout className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Parcela</span></TabsTrigger>
            <TabsTrigger value="participants"><MapPin className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Participantes</span></TabsTrigger>
          </TabsList>

          <TabsContent value="ident">
            <Card><CardHeader><CardTitle>Identificação da Escola de Campo</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Designação da ECA *</FormLabel><FormControl><Input {...field} placeholder="Ex.: ECA Catabola - Milho 2026" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="trade_name" render={({ field }) => (
                  <FormItem><FormLabel>Código / Nome curto</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Contacto</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="focus_crop" render={({ field }) => (
                  <FormItem><FormLabel>Cultura Focal</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="Ex.: Milho" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
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
                  <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="promoter">
            <Card><CardHeader><CardTitle>Promotor e Patrocínio</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="promoter_entity" render={({ field }) => (
                  <FormItem><FormLabel>Tipo de Entidade Promotora</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{promoterEntities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="promoter_name" render={({ field }) => (
                  <FormItem><FormLabel>Nome do Promotor</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="funding_source" render={({ field }) => (
                  <FormItem><FormLabel>Fonte de Financiamento</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="FAO, Banco Mundial, OGE…" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="linked_project" render={({ field }) => (
                  <FormItem><FormLabel>Projeto Associado</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="pedagogy">
            <Card><CardHeader><CardTitle>Dados Pedagógicos</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="start_date" render={({ field }) => (
                  <FormItem><FormLabel>Data de Início</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="duration_months" render={({ field }) => (
                  <FormItem><FormLabel>Duração (meses)</FormLabel><FormControl>
                    <Input type="number" min="1" max="36" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="curriculum_modules" render={({ field }) => (
                <FormItem><FormLabel>Módulos do Currículo</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {moduleOptions.map(m => (
                      <Button key={m} type="button" size="sm"
                        variant={field.value?.includes(m) ? 'default' : 'outline'}
                        onClick={() => {
                          const cur = field.value || [];
                          field.onChange(cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
                        }}>{m}</Button>
                    ))}
                  </div>
                </FormItem>
              )} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="class">
            <Card><CardHeader><CardTitle>Composição da Turma</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField control={form.control} name="participants_count" render={({ field }) => (
                  <FormItem><FormLabel>Total de Participantes</FormLabel><FormControl>
                    <Input type="number" min="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
                <FormField control={form.control} name="participants_male" render={({ field }) => (
                  <FormItem><FormLabel>Homens</FormLabel><FormControl>
                    <Input type="number" min="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
                <FormField control={form.control} name="participants_female" render={({ field }) => (
                  <FormItem><FormLabel>Mulheres</FormLabel><FormControl>
                    <Input type="number" min="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="avg_age_range" render={({ field }) => (
                  <FormItem><FormLabel>Faixa Etária Predominante</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{ageRanges.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select></FormItem>
                )} />
                <FormField control={form.control} name="avg_education_level" render={({ field }) => (
                  <FormItem><FormLabel>Escolaridade Média</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{educationLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select></FormItem>
                )} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="parcel">
            <Card><CardHeader><CardTitle>Parcela Demonstrativa</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField control={form.control} name="demo_parcel_area_ha" render={({ field }) => (
                  <FormItem><FormLabel>Área (ha)</FormLabel><FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
                <FormField control={form.control} name="demo_latitude" render={({ field }) => (
                  <FormItem><FormLabel>Latitude</FormLabel><FormControl>
                    <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
                <FormField control={form.control} name="demo_longitude" render={({ field }) => (
                  <FormItem><FormLabel>Longitude</FormLabel><FormControl>
                    <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                  </FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="demo_crops" render={({ field }) => (
                <FormItem><FormLabel>Culturas Demonstradas</FormLabel>
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
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Observações / Calendário</FormLabel><FormControl>
                  <Textarea {...field} value={field.value || ''} placeholder="Notas, calendário de sessões, materiais necessários…" />
                </FormControl></FormItem>
              )} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card><CardHeader><CardTitle>Participantes Inscritos</CardTitle></CardHeader><CardContent>
              <MemberSelector
                organizationId={farmer?.id}
                organizationType="field_school"
                selectedMembers={members}
                onMembersChange={setMembers}
              />
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'A guardar...' : farmer ? 'Atualizar ECA' : 'Criar ECA'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
