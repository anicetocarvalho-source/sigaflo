import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { GRAIN_TYPES, type GrainType } from '@/lib/grains';

const priceSchema = z.object({
  grain_type: z.enum(['arroz','milho','trigo','sorgo','massambala','massango','cevada','aveia']),
  province_id: z.string().min(1, 'Seleccione uma província'),
  recorded_date: z.string().min(1, 'Data é obrigatória'),
  retail_price_aoa: z.coerce.number().min(0, 'Valor deve ser positivo'),
  wholesale_price_aoa: z.coerce.number().min(0).optional(),
  rice_type: z.string().optional(),
  market_name: z.string().max(200).optional(),
  exchange_rate_usd: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

type PriceFormData = z.infer<typeof priceSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGrainType?: GrainType;
}

export function RicePriceForm({ open, onOpenChange }: Props) {
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

  const form = useForm<PriceFormData>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      recorded_date: new Date().toISOString().split('T')[0],
      retail_price_aoa: 0,
      rice_type: 'branco',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: PriceFormData) => {
      const { error } = await supabase.from('rice_prices').insert({
        province_id: values.province_id,
        recorded_date: values.recorded_date,
        retail_price_aoa: values.retail_price_aoa,
        wholesale_price_aoa: values.wholesale_price_aoa || null,
        rice_type: values.rice_type || 'branco',
        market_name: values.market_name || null,
        exchange_rate_usd: values.exchange_rate_usd || null,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-prices'] });
      queryClient.invalidateQueries({ queryKey: ['rice-stats'] });
      toast.success('Preço registado com sucesso');
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Erro ao registar preço: ' + error.message);
    },
  });

  const onSubmit = (values: PriceFormData) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registar Preço de Arroz</DialogTitle>
          <DialogDescription>
            Adicione preços de retalho e atacado por província
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="recorded_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Registo *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rice_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Arroz</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="branco">Arroz Branco</SelectItem>
                        <SelectItem value="parboilizado">Parboilizado</SelectItem>
                        <SelectItem value="integral">Integral</SelectItem>
                        <SelectItem value="perfumado">Perfumado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="market_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mercado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mercado do Kikolo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="retail_price_aoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Retalho (AOA/kg) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 850"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wholesale_price_aoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Atacado (AOA/kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 720"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="exchange_rate_usd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de Câmbio (AOA/USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 825"
                      {...field}
                    />
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
                Registar Preço
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
