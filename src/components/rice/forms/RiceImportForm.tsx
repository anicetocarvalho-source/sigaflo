import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { GRAIN_TYPES, type GrainType } from '@/lib/grains';

const importSchema = z.object({
  grain_type: z.enum(['arroz','milho','trigo','sorgo','massambala','massango','cevada','aveia']),
  year: z.coerce.number().min(2000).max(2100),
  month: z.coerce.number().min(1).max(12),
  origin_country: z.string().min(1, 'Seleccione o país de origem').max(100),
  volume_tonnes: z.coerce.number().min(0, 'Valor deve ser positivo'),
  price_cif_usd: z.coerce.number().min(0).optional(),
  price_fob_usd: z.coerce.number().min(0).optional(),
  rice_type: z.string().optional(),
  importer_name: z.string().max(200).optional(),
  port_of_entry: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type ImportFormData = z.infer<typeof importSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGrainType?: GrainType;
}

const originCountries = [
  'Tailândia',
  'Vietname',
  'Paquistão',
  'Índia',
  'China',
  'Brasil',
  'EUA',
  'Outro',
];

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export function RiceImportForm({ open, onOpenChange, defaultGrainType }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      grain_type: defaultGrainType ?? 'arroz',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      volume_tonnes: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ImportFormData) => {
      const total_value_usd = values.price_cif_usd
        ? values.volume_tonnes * values.price_cif_usd
        : null;

      const { error } = await supabase.from('rice_imports').insert({
        grain_type: values.grain_type,
        year: values.year,
        month: values.month,
        origin_country: values.origin_country,
        volume_tonnes: values.volume_tonnes,
        price_cif_usd: values.price_cif_usd || null,
        price_fob_usd: values.price_fob_usd || null,
        total_value_usd,
        rice_type: values.rice_type || null,
        importer_name: values.importer_name || null,
        port_of_entry: values.port_of_entry || null,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-imports'] });
      queryClient.invalidateQueries({ queryKey: ['rice-stats'] });
      toast.success('Dados de importação registados com sucesso');
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Erro ao registar dados: ' + error.message);
    },
  });

  const onSubmit = (values: ImportFormData) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registar Importação de Arroz</DialogTitle>
          <DialogDescription>
            Adicione dados de importação por país de origem
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
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

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês *</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value.toString()}>
                            {m.label}
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
                name="origin_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País de Origem *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {originCountries.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                name="volume_tonnes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (toneladas) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rice_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Arroz</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="branco">Arroz Branco</SelectItem>
                        <SelectItem value="parboilizado">Parboilizado</SelectItem>
                        <SelectItem value="integral">Integral</SelectItem>
                        <SelectItem value="perfumado">Perfumado</SelectItem>
                        <SelectItem value="basmati">Basmati</SelectItem>
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
                name="price_fob_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço FOB (USD/t)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 420"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_cif_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço CIF (USD/t)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 485"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="importer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port_of_entry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porto de Entrada</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Luanda">Porto de Luanda</SelectItem>
                        <SelectItem value="Lobito">Porto do Lobito</SelectItem>
                        <SelectItem value="Namibe">Porto do Namibe</SelectItem>
                        <SelectItem value="Cabinda">Porto de Cabinda</SelectItem>
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
                Registar Importação
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
