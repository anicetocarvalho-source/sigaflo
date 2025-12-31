import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, MapPin, Package, Ship, FileText, Save, Loader2 } from 'lucide-react';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { useCreateCoffeeLot, useUpdateCoffeeLot, CoffeeLot } from '@/hooks/useCoffee';

const formSchema = z.object({
  lot_code: z.string().min(1, 'Código do lote é obrigatório'),
  origin_province_id: z.string().optional(),
  origin_municipality_id: z.string().optional(),
  origin_commune_id: z.string().optional(),
  origin_location: z.string().optional(),
  producers_count: z.coerce.number().min(1, 'Mínimo 1 produtor'),
  volume_kg: z.coerce.number().min(1, 'Volume deve ser maior que 0'),
  bags_count: z.coerce.number().min(0).optional(),
  variety: z.string().optional(),
  quality_grade: z.string().optional(),
  harvest_year: z.coerce.number().optional(),
  harvest_season: z.string().optional(),
  processing_method: z.string().optional(),
  exporter_name: z.string().optional(),
  buyer_name: z.string().optional(),
  destination_country: z.string().optional(),
  status: z.string().default('registered'),
  transport_document_number: z.string().optional(),
  export_declaration_number: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot?: CoffeeLot | null;
}

const coffeeVarieties = [
  'Robusta',
  'Arábica',
  'Conilon',
  'Catimor',
  'Catuaí',
  'Mundo Novo',
  'Bourbon',
];

const qualityGrades = [
  'Premium (85+)',
  'Especialidade (80-84)',
  'Comercial (70-79)',
  'Standard (<70)',
];

const processingMethods = [
  'Via Húmida (Lavado)',
  'Via Seca (Natural)',
  'Honey (Semi-Lavado)',
  'Fermentação Anaeróbica',
];

const harvestSeasons = [
  'Principal (Abr-Jul)',
  'Secundária (Out-Dez)',
];

const destinationCountries = [
  'Portugal',
  'Alemanha',
  'Itália',
  'Estados Unidos',
  'Japão',
  'China',
  'Holanda',
  'Bélgica',
  'França',
  'Espanha',
];

export function CoffeeLotForm({ open, onOpenChange, lot }: Props) {
  const [activeTab, setActiveTab] = useState('origem');
  const createMutation = useCreateCoffeeLot();
  const updateMutation = useUpdateCoffeeLot();

  const {
    provinces,
    municipalities,
    communes,
    selectedProvinceId,
    selectedMunicipalityId,
    setSelectedProvinceId,
    setSelectedMunicipalityId,
  } = useLocationCascade();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lot_code: lot?.lot_code || `LOT-${Date.now().toString(36).toUpperCase()}`,
      origin_province_id: lot?.origin_province_id || '',
      origin_municipality_id: lot?.origin_municipality_id || '',
      origin_commune_id: lot?.origin_commune_id || '',
      origin_location: lot?.origin_location || '',
      producers_count: lot?.producers_count || 1,
      volume_kg: lot?.volume_kg || 0,
      bags_count: lot?.bags_count || 0,
      variety: lot?.variety || '',
      quality_grade: lot?.quality_grade || '',
      harvest_year: lot?.harvest_year || new Date().getFullYear(),
      harvest_season: lot?.harvest_season || '',
      processing_method: lot?.processing_method || '',
      exporter_name: lot?.exporter_name || '',
      buyer_name: lot?.buyer_name || '',
      destination_country: lot?.destination_country || '',
      status: lot?.status || 'registered',
      transport_document_number: lot?.transport_document_number || '',
      export_declaration_number: lot?.export_declaration_number || '',
      notes: lot?.notes || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      origin_province_id: values.origin_province_id || null,
      origin_municipality_id: values.origin_municipality_id || null,
      origin_commune_id: values.origin_commune_id || null,
      registered_at: lot?.registered_at || new Date().toISOString(),
    };

    if (lot?.id) {
      await updateMutation.mutateAsync({ id: lot.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload as any);
    }
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            {lot ? 'Editar Lote de Café' : 'Novo Lote de Café'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="origem" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Origem
                </TabsTrigger>
                <TabsTrigger value="produto" className="gap-2">
                  <Coffee className="h-4 w-4" />
                  Produto
                </TabsTrigger>
                <TabsTrigger value="exportacao" className="gap-2">
                  <Ship className="h-4 w-4" />
                  Exportação
                </TabsTrigger>
                <TabsTrigger value="documentos" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="origem" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="lot_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Lote *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="LOT-XXXXX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="origin_province_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Província</FormLabel>
                            <Select
                              value={field.value || ''}
                              onValueChange={(v) => {
                                field.onChange(v);
                                setSelectedProvinceId(v);
                                form.setValue('origin_municipality_id', '');
                                form.setValue('origin_commune_id', '');
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {provinces?.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
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
                        name="origin_municipality_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Município</FormLabel>
                            <Select
                              value={field.value || ''}
                              onValueChange={(v) => {
                                field.onChange(v);
                                setSelectedMunicipalityId(v);
                                form.setValue('origin_commune_id', '');
                              }}
                              disabled={!selectedProvinceId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {municipalities?.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name}
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
                        name="origin_commune_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comuna</FormLabel>
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              disabled={!selectedMunicipalityId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {communes?.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
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
                      name="origin_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização Específica</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome da fazenda, aldeia, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="producers_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Produtores *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="produto" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="volume_kg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume (kg) *</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bags_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Sacas</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="variety"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variedade</FormLabel>
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar variedade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {coffeeVarieties.map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quality_grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classificação de Qualidade</FormLabel>
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar grau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {qualityGrades.map((g) => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="harvest_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano da Colheita</FormLabel>
                            <FormControl>
                              <Input type="number" min="2020" max="2030" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="harvest_season"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Época de Colheita</FormLabel>
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {harvestSeasons.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="processing_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Processamento</FormLabel>
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {processingMethods.map((m) => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exportacao" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="exporter_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Exportador</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Empresa exportadora" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Comprador</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Empresa compradora" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destination_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País de Destino</FormLabel>
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar país" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {destinationCountries.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado do Lote</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="registered">Registado</SelectItem>
                              <SelectItem value="in_processing">Em Processamento</SelectItem>
                              <SelectItem value="in_transit">Em Trânsito</SelectItem>
                              <SelectItem value="exported">Exportado</SelectItem>
                              <SelectItem value="rejected">Rejeitado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="transport_document_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Documento de Transporte</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="DT-XXXXX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="export_declaration_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Declaração de Exportação</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="DE-XXXXX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Notas adicionais sobre o lote..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {lot ? 'Guardar Alterações' : 'Criar Lote'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
