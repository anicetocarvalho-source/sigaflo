import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCreateOccurrence, useClassifyOccurrence } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  occurrence_type: z.string().min(1, 'Selecione o tipo de ocorrência'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  province_id: z.string().optional(),
  municipality_id: z.string().optional(),
  commune_id: z.string().optional(),
  affected_area_ha: z.number().optional(),
  affected_farmers_count: z.number().optional(),
  estimated_loss_aoa: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OccurrenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoordinates?: { lat: number; lng: number } | null;
}

const occurrenceTypes = [
  { value: 'drought', label: 'Seca', icon: '☀️' },
  { value: 'flood', label: 'Inundação', icon: '🌊' },
  { value: 'pest', label: 'Praga', icon: '🦗' },
  { value: 'disease', label: 'Doença', icon: '🦠' },
  { value: 'frost', label: 'Geada', icon: '❄️' },
  { value: 'hail', label: 'Granizo', icon: '🌨️' },
  { value: 'fire', label: 'Incêndio', icon: '🔥' },
  { value: 'other', label: 'Outro', icon: '❓' },
];

const severityConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  low: { label: 'Baixo', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  medium: { label: 'Médio', color: 'bg-yellow-500', icon: <AlertTriangle className="h-4 w-4" /> },
  high: { label: 'Alto', color: 'bg-orange-500', icon: <AlertTriangle className="h-4 w-4" /> },
  critical: { label: 'Crítico', color: 'bg-red-500', icon: <AlertTriangle className="h-4 w-4" /> },
};

export function OccurrenceForm({ open, onOpenChange, initialCoordinates }: OccurrenceFormProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [aiClassification, setAiClassification] = useState<any>(null);
  const [bestPractices, setBestPractices] = useState<string[]>([]);

  const createOccurrence = useCreateOccurrence();
  const classifyOccurrence = useClassifyOccurrence();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      occurrence_type: '',
      description: '',
      latitude: initialCoordinates?.lat,
      longitude: initialCoordinates?.lng,
    },
  });

  // Update coordinates when initialCoordinates changes
  useEffect(() => {
    if (initialCoordinates) {
      form.setValue('latitude', initialCoordinates.lat);
      form.setValue('longitude', initialCoordinates.lng);
    }
  }, [initialCoordinates, form]);

  useEffect(() => {
    async function fetchProvinces() {
      const { data } = await supabase.from('provinces').select('*').order('name');
      if (data) setProvinces(data);
    }
    fetchProvinces();
  }, []);

  useEffect(() => {
    async function fetchMunicipalities() {
      const provinceId = form.watch('province_id');
      if (provinceId) {
        const { data } = await supabase
          .from('municipalities')
          .select('*')
          .eq('province_id', provinceId)
          .order('name');
        if (data) setMunicipalities(data);
      } else {
        setMunicipalities([]);
        setCommunes([]);
      }
    }
    fetchMunicipalities();
  }, [form.watch('province_id')]);

  useEffect(() => {
    async function fetchCommunes() {
      const municipalityId = form.watch('municipality_id');
      if (municipalityId) {
        const { data } = await supabase
          .from('communes')
          .select('*')
          .eq('municipality_id', municipalityId)
          .order('name');
        if (data) setCommunes(data);
      } else {
        setCommunes([]);
      }
    }
    fetchCommunes();
  }, [form.watch('municipality_id')]);

  const handleClassify = async () => {
    const values = form.getValues();
    if (!values.occurrence_type || !values.description) {
      return;
    }

    try {
      const result = await classifyOccurrence.mutateAsync({
        occurrence_type: values.occurrence_type,
        description: values.description,
        affected_area_ha: values.affected_area_ha,
        affected_farmers_count: values.affected_farmers_count,
      });

      if (result.success) {
        setAiClassification(result.classification);
        setBestPractices(result.best_practices);
      }
    } catch (error) {
      console.error('Classification error:', error);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createOccurrence.mutateAsync({
        ...values,
        severity: aiClassification?.severity || 'medium',
        ai_classification: aiClassification,
        best_practices: bestPractices.slice(0, 3),
        source: 'backoffice',
        status: 'reported',
      });
      form.reset();
      setAiClassification(null);
      setBestPractices([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating occurrence:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registar Nova Ocorrência</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Seca severa na região norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="occurrence_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Ocorrência</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {occurrenceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
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
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Província</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a província" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
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
                name="municipality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={municipalities.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o município" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {municipalities.map((municipality) => (
                          <SelectItem key={municipality.id} value={municipality.id}>
                            {municipality.name}
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
                name="commune_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={communes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a comuna" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {communes.map((commune) => (
                          <SelectItem key={commune.id} value={commune.id}>
                            {commune.name}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva a ocorrência em detalhes..."
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="affected_area_ha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Afetada (ha)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affected_farmers_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agricultores Afetados</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_loss_aoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perdas Estimadas (AOA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Coordinates display */}
            {(form.watch('latitude') || form.watch('longitude')) && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📍 Coordenadas:</span>
                  <span className="font-mono">
                    {form.watch('latitude')?.toFixed(6)}, {form.watch('longitude')?.toFixed(6)}
                  </span>
                </div>
              </div>
            )}

            {/* AI Classification Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClassify}
                disabled={classifyOccurrence.isPending || !form.getValues('occurrence_type') || !form.getValues('description')}
              >
                {classifyOccurrence.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Classificar com IA
              </Button>
            </div>

            {/* AI Classification Result */}
            {aiClassification && (
              <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Classificação IA</span>
                  <div className="flex items-center gap-2">
                    <Badge className={severityConfig[aiClassification.severity]?.color}>
                      {severityConfig[aiClassification.severity]?.icon}
                      <span className="ml-1">{severityConfig[aiClassification.severity]?.label}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(aiClassification.confidence * 100).toFixed(0)}% confiança
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{aiClassification.reasoning}</p>
              </div>
            )}

            {/* Best Practices */}
            {bestPractices.length > 0 && (
              <div className="rounded-lg border p-4 space-y-2">
                <span className="text-sm font-medium">Boas Práticas Recomendadas</span>
                <ul className="space-y-1">
                  {bestPractices.slice(0, 3).map((practice, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createOccurrence.isPending}>
                {createOccurrence.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registar Ocorrência
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
