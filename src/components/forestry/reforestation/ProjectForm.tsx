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
  project_name: z.string().min(3, 'Nome do projecto é obrigatório'),
  project_type: z.string().min(1, 'Tipo é obrigatório'),
  implementing_entity: z.string().min(1, 'Entidade é obrigatória'),
  funding_source: z.string().optional(),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().optional(),
  province_id: z.string().min(1, 'Província é obrigatória'),
  municipality_id: z.string().optional(),
  target_area_ha: z.coerce.number().min(0.1, 'Área alvo é obrigatória'),
  target_trees: z.coerce.number().min(1, 'Número de árvores é obrigatório'),
  primary_species: z.string().min(1, 'Espécie principal é obrigatória'),
  secondary_species: z.string().optional(),
  description: z.string().optional(),
  objectives: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
  isEdit?: boolean;
}

const projectTypes = [
  { value: 'restoration', label: 'Restauração Florestal' },
  { value: 'afforestation', label: 'Florestação' },
  { value: 'community', label: 'Floresta Comunitária' },
  { value: 'commercial', label: 'Plantação Comercial' },
  { value: 'conservation', label: 'Conservação' },
  { value: 'agroforestry', label: 'Agroflorestal' },
];

const commonSpecies = [
  'Eucalipto',
  'Pinheiro',
  'Acácia',
  'Mukwa',
  'Umbila',
  'Muvuca',
  'Pau-rosa',
  'Girassonde',
  'Mangueira',
  'Cajueiro',
];

export function ProjectForm({ open, onClose, onSubmit, initialData, isEdit }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: initialData?.project_name || '',
      project_type: initialData?.project_type || '',
      implementing_entity: initialData?.implementing_entity || '',
      funding_source: initialData?.funding_source || '',
      start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
      end_date: initialData?.end_date || '',
      province_id: initialData?.province_id || '',
      municipality_id: initialData?.municipality_id || '',
      target_area_ha: initialData?.target_area_ha || 0,
      target_trees: initialData?.target_trees || 0,
      primary_species: initialData?.primary_species || '',
      secondary_species: initialData?.secondary_species || '',
      description: initialData?.description || '',
      objectives: initialData?.objectives || '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
    },
  });

  const locationCascade = useLocationCascade();
  const { provinces, municipalities } = locationCascade;
  const provinceId = form.watch('province_id');

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
          <DialogTitle>{isEdit ? 'Editar Projecto' : 'Novo Projecto de Reflorestamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informação Básica</TabsTrigger>
                <TabsTrigger value="location">Localização</TabsTrigger>
                <TabsTrigger value="species">Espécies e Metas</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="project_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Projecto *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Reflorestamento da Reserva de Maiombe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="project_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Projecto *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectTypes.map(type => (
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
                    name="implementing_entity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entidade Implementadora *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome da entidade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="funding_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonte de Financiamento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: OGE, BAD, GEF" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Início *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Fim</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descreva o projecto..." rows={3} />
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={!provinceId}>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude (centro)</FormLabel>
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
                        <FormLabel>Longitude (centro)</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} placeholder="13.5678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="species" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target_area_ha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Alvo (ha) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} placeholder="100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target_trees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Árvores a Plantar *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="10000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécie Principal *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione a espécie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commonSpecies.map(sp => (
                              <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondary_species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécies Secundárias</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Acácia, Mangueira" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectivos do Projecto</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descreva os objectivos..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar Alterações' : 'Criar Projecto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
