import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFarmers } from '@/hooks/useFarmers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import type { ProductionRecord } from '@/hooks/useProductionHistory';

const CROPS = [
  { value: 'arroz', label: 'Arroz' },
  { value: 'milho', label: 'Milho' },
  { value: 'feijao', label: 'Feijão' },
  { value: 'mandioca', label: 'Mandioca' },
  { value: 'batata_doce', label: 'Batata Doce' },
  { value: 'amendoim', label: 'Amendoim' },
  { value: 'soja', label: 'Soja' },
  { value: 'cafe', label: 'Café' },
  { value: 'horticolas', label: 'Hortícolas' },
  { value: 'outros', label: 'Outros' },
];

const SEASONS = [
  { value: 'principal', label: 'Campanha Principal' },
  { value: 'intermediaria', label: 'Campanha Intermédia' },
  { value: 'seca', label: 'Campanha de Seca' },
];

const QUALITY_GRADES = ['A', 'B', 'C', 'D', 'E'];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

const formSchema = z.object({
  farmer_id: z.string().min(1, 'Selecione um agricultor'),
  crop_type: z.string().min(1, 'Selecione uma cultura'),
  season: z.string().min(1, 'Selecione uma campanha'),
  year: z.coerce.number().min(2000).max(currentYear + 1),
  area_planted_ha: z.coerce.number().min(0).optional().nullable(),
  expected_yield_kg: z.coerce.number().min(0).optional().nullable(),
  actual_yield_kg: z.coerce.number().min(0).optional().nullable(),
  harvest_date: z.string().optional().nullable(),
  quality_grade: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductionFormProps {
  initialData?: ProductionRecord;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductionForm = ({ initialData, onSubmit, onCancel, isLoading }: ProductionFormProps) => {
  const { data: farmers, isLoading: loadingFarmers } = useFarmers();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmer_id: initialData?.farmer_id || '',
      crop_type: initialData?.crop_type || '',
      season: initialData?.season || '',
      year: initialData?.year || currentYear,
      area_planted_ha: initialData?.area_planted_ha || null,
      expected_yield_kg: initialData?.expected_yield_kg || null,
      actual_yield_kg: initialData?.actual_yield_kg || null,
      harvest_date: initialData?.harvest_date || null,
      quality_grade: initialData?.quality_grade || null,
      notes: initialData?.notes || null,
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="farmer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agricultor *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o agricultor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingFarmers ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : farmers && farmers.length > 0 ? (
                        farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.name} ({farmer.registration_number})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Nenhum agricultor encontrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crop_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cultura *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cultura" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CROPS.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>
                          {crop.label}
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
              name="season"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campanha *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a campanha" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEASONS.map((season) => (
                        <SelectItem key={season.value} value={season.value}>
                          {season.label}
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
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados de Produção</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="area_planted_ha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Plantada (ha)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_yield_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produção Esperada (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actual_yield_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produção Real (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="harvest_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Colheita</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quality_grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grau de Qualidade</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === 'none' ? null : val)} 
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o grau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Não avaliado</SelectItem>
                      {QUALITY_GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          Grau {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre a produção..."
                      rows={4}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};
