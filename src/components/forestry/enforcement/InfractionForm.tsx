import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  infraction_type: z.string().min(1, 'Tipo é obrigatório'),
  severity: z.string().min(1, 'Gravidade é obrigatória'),
  operator_name: z.string().min(1, 'Nome do operador é obrigatório'),
  operator_license: z.string().optional(),
  occurrence_date: z.string().min(1, 'Data é obrigatória'),
  province_id: z.string().min(1, 'Província é obrigatória'),
  municipality_id: z.string().optional(),
  location_description: z.string().min(1, 'Descrição do local é obrigatória'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  description: z.string().min(10, 'Descrição detalhada é obrigatória'),
  seized_volume_m3: z.coerce.number().optional(),
  seized_species: z.string().optional(),
  evidence_description: z.string().optional(),
  inspector_name: z.string().min(1, 'Nome do fiscal é obrigatório'),
  inspector_badge: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InfractionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
  isEdit?: boolean;
}

const infractionTypes = [
  { value: 'illegal_logging', label: 'Corte Ilegal' },
  { value: 'transport_violation', label: 'Violação de Transporte' },
  { value: 'license_violation', label: 'Violação de Licença' },
  { value: 'protected_species', label: 'Espécie Protegida' },
  { value: 'unauthorized_area', label: 'Área Não Autorizada' },
  { value: 'document_fraud', label: 'Fraude Documental' },
  { value: 'volume_excess', label: 'Excesso de Volume' },
  { value: 'other', label: 'Outra' },
];

const severityLevels = [
  { value: 'minor', label: 'Leve' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'serious', label: 'Grave' },
  { value: 'very_serious', label: 'Muito Grave' },
];

export function InfractionForm({ open, onClose, onSubmit, initialData, isEdit }: InfractionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      infraction_type: initialData?.infraction_type || '',
      severity: initialData?.severity || '',
      operator_name: initialData?.operator_name || '',
      operator_license: initialData?.operator_license || '',
      occurrence_date: initialData?.occurrence_date || new Date().toISOString().split('T')[0],
      province_id: initialData?.province_id || '',
      municipality_id: initialData?.municipality_id || '',
      location_description: initialData?.location_description || '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      description: initialData?.description || '',
      seized_volume_m3: initialData?.seized_volume_m3,
      seized_species: initialData?.seized_species || '',
      evidence_description: initialData?.evidence_description || '',
      inspector_name: initialData?.inspector_name || '',
      inspector_badge: initialData?.inspector_badge || '',
    },
  });

  const provinceId = form.watch('province_id');
  const locationCascade = useLocationCascade();
  const { provinces, municipalities } = locationCascade;

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Infração' : 'Registar Nova Infração'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="location">Localização</TabsTrigger>
                <TabsTrigger value="seizure">Apreensão</TabsTrigger>
                <TabsTrigger value="inspector">Fiscal</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="infraction_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Infração *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {infractionTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gravidade *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione a gravidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {severityLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="operator_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Operador/Infractor *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome completo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="operator_license"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Licença do Operador</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Se aplicável" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="occurrence_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Ocorrência *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva os factos observados..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="location" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="province_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione a província" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces?.map(prov => (
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
                    name="municipality_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!provinceId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione o município" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {municipalities?.map(mun => (
                              <SelectItem key={mun.id} value={mun.id}>
                                {mun.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Local *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Referências do local (estrada, aldeia, pontos de referência...)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} placeholder="-12.3456" />
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
                          <Input type="number" step="any" {...field} placeholder="13.5678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="seizure" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seized_volume_m3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume Apreendido (m³)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seized_species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécies Apreendidas</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Umbila, Pau-rosa" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="evidence_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição das Provas</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva as provas recolhidas (fotografias, documentos, testemunhos...)"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="inspector" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="inspector_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Fiscal *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome completo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inspector_badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Crachá/Matrícula</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Identificação do fiscal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar Alterações' : 'Registar Infração'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
