import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Leaf, BarChart3, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { useFarmers } from '@/hooks/useFarmers';

const sensoryAttributes = [
  { id: 'acidez_alta', label: 'Acidez Alta' },
  { id: 'acidez_media', label: 'Acidez Média' },
  { id: 'acidez_baixa', label: 'Acidez Baixa' },
  { id: 'corpo_encorpado', label: 'Corpo Encorpado' },
  { id: 'corpo_medio', label: 'Corpo Médio' },
  { id: 'corpo_leve', label: 'Corpo Leve' },
  { id: 'docura_pronunciada', label: 'Doçura Pronunciada' },
  { id: 'docura_suave', label: 'Doçura Suave' },
  { id: 'aroma_floral', label: 'Aroma Floral' },
  { id: 'aroma_frutado', label: 'Aroma Frutado' },
  { id: 'aroma_chocolate', label: 'Aroma Chocolate' },
  { id: 'aroma_caramelo', label: 'Aroma Caramelo' },
  { id: 'sabor_citrico', label: 'Sabor Cítrico' },
  { id: 'sabor_nozes', label: 'Sabor Nozes' },
  { id: 'sabor_especiarias', label: 'Sabor Especiarias' },
  { id: 'finalizacao_longa', label: 'Finalização Longa' },
  { id: 'finalizacao_limpa', label: 'Finalização Limpa' },
];

const agriculturalPractices = [
  { id: 'organico', label: 'Cultivo Orgânico' },
  { id: 'sombra', label: 'Cultivo à Sombra' },
  { id: 'irrigacao', label: 'Sistema de Irrigação' },
  { id: 'controle_pragas', label: 'Controle Integrado de Pragas' },
  { id: 'fertilizacao_organica', label: 'Fertilização Orgânica' },
  { id: 'conservacao_solo', label: 'Conservação do Solo' },
  { id: 'colheita_seletiva', label: 'Colheita Seletiva' },
  { id: 'processamento_lavado', label: 'Processamento Lavado' },
  { id: 'processamento_natural', label: 'Processamento Natural' },
  { id: 'processamento_honey', label: 'Processamento Honey' },
];

const formSchema = z.object({
  farmer_id: z.string().min(1, 'Selecione um produtor'),
  total_area_ha: z.coerce.number().min(0.01, 'Área total deve ser maior que 0'),
  productive_area_ha: z.coerce.number().min(0.01, 'Área produtiva deve ser maior que 0'),
  annual_production_kg: z.coerce.number().min(0, 'Produção deve ser maior ou igual a 0'),
  harvest_year: z.coerce.number().min(2020).max(2030),
  variety: z.string().optional(),
  altitude_m: z.coerce.number().min(0, 'Altitude deve ser positiva').max(5000, 'Altitude máxima: 5000m').optional(),
  agricultural_practices: z.array(z.string()).default([]),
  sensory_profile: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoffeeProductionForm({ open, onOpenChange }: Props) {
  const { data: farmers, isLoading: loadingFarmers } = useFarmers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmer_id: '',
      total_area_ha: 0,
      productive_area_ha: 0,
      annual_production_kg: 0,
      harvest_year: new Date().getFullYear(),
      variety: '',
      altitude_m: undefined,
      agricultural_practices: [],
      sensory_profile: [],
      notes: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Save to database when table is created
      console.log('Coffee production data:', values);
      toast.success('Produção de café registada com sucesso');
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao registar produção');
    } finally {
      setIsSubmitting(false);
    }
  };

  const coffeeProducers = farmers?.filter(f => 
    f.main_crops?.includes('Café') || f.secondary_crops?.includes('Café')
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coffee className="h-5 w-5 text-amber-600" />
            Registo de Produção de Café
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Produtor Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Produtor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="farmer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produtor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produtor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingFarmers ? (
                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                          ) : coffeeProducers.length === 0 ? (
                            <SelectItem value="none" disabled>Nenhum produtor de café encontrado</SelectItem>
                          ) : (
                            coffeeProducers.map((farmer) => (
                              <SelectItem key={farmer.id} value={farmer.id}>
                                {farmer.name} {farmer.registration_number ? `(${farmer.registration_number})` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variedade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a variedade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="robusta">Robusta</SelectItem>
                            <SelectItem value="arabica">Arábica</SelectItem>
                            <SelectItem value="liberica">Libérica</SelectItem>
                            <SelectItem value="excelsa">Excelsa</SelectItem>
                            <SelectItem value="misto">Misto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="harvest_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano de Colheita *</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[2024, 2025, 2026].map((year) => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
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

            {/* Área Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Área e Produção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="total_area_ha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Total (ha) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productive_area_ha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Produtiva (ha) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annual_production_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produção Anual (kg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="altitude_m"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altitude (m)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" placeholder="Ex: 1200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Práticas Agrícolas Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Práticas Agrícolas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="agricultural_practices"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {agriculturalPractices.map((practice) => (
                          <FormField
                            key={practice.id}
                            control={form.control}
                            name="agricultural_practices"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(practice.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, practice.id]);
                                      } else {
                                        field.onChange(current.filter((v) => v !== practice.id));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {practice.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Perfil Sensorial Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Perfil Sensorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="sensory_profile"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {sensoryAttributes.map((attr) => (
                          <FormField
                            key={attr.id}
                            control={form.control}
                            name="sensory_profile"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(attr.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, attr.id]);
                                      } else {
                                        field.onChange(current.filter((v) => v !== attr.id));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {attr.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionais sobre a produção..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A guardar...' : 'Registar Produção'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
