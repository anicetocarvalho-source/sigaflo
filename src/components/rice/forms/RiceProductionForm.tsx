import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { riceProductionFormSchema, type RiceProductionFormValues } from '@/lib/validations';
import { GRAIN_TYPES, type GrainType } from '@/lib/grains';

interface FormProps {
  defaultGrainType?: GrainType;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RiceProductionForm({ open, onOpenChange, defaultGrainType }: Props & FormProps) {
  const queryClient = useQueryClient();

  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<RiceProductionFormValues>({
    resolver: zodResolver(riceProductionFormSchema),
    defaultValues: {
      grain_type: defaultGrainType ?? 'arroz',
      year: new Date().getFullYear(),
      season: 'principal',
      cultivated_area_ha: 0,
      harvested_area_ha: 0,
      production_tonnes: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: RiceProductionFormValues) => {
      const productivity_kg_ha = values.harvested_area_ha > 0
        ? (values.production_tonnes * 1000) / values.harvested_area_ha
        : null;

      const { error } = await supabase.from('rice_production').insert({
        grain_type: values.grain_type,
        province_id: values.province_id,
        year: values.year,
        season: values.season,
        cultivated_area_ha: values.cultivated_area_ha,
        harvested_area_ha: values.harvested_area_ha,
        production_tonnes: values.production_tonnes,
        productivity_kg_ha,
        variety: values.variety || null,
        irrigation_type: values.irrigation_type || null,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-production'] });
      queryClient.invalidateQueries({ queryKey: ['rice-stats'] });
      toast.success('Dados de produção registados com sucesso');
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Erro ao registar dados: ' + error.message);
    },
  });

  const onSubmit = (values: RiceProductionFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registar Produção de Grãos</DialogTitle>
          <DialogDescription>
            Adicione dados de produção por província, época e tipo de grão
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="grain_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Grão *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-50 bg-popover">
                      {GRAIN_TYPES.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.emoji} {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          <SelectValue placeholder="Seleccione" />
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Época *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="pequena">Pequena Época</SelectItem>
                        <SelectItem value="sequeiro">Sequeiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variedade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IR-64">IR-64</SelectItem>
                        <SelectItem value="NERICA-4">NERICA-4</SelectItem>
                        <SelectItem value="NERICA-L19">NERICA-L19</SelectItem>
                        <SelectItem value="Local">Variedade Local</SelectItem>
                        <SelectItem value="Misto">Misto</SelectItem>
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
                name="cultivated_area_ha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Cultivada (ha) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harvested_area_ha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Colhida (ha) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="production_tonnes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produção (toneladas) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="irrigation_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Irrigação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sequeiro">Sequeiro</SelectItem>
                        <SelectItem value="irrigado">Irrigado</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="misto">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionais..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Registar Produção
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
