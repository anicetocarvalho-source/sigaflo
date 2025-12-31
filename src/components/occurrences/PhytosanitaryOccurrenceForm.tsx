import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Bug, Leaf, Sparkles, AlertCircle } from 'lucide-react';
import { useCreateOccurrence, useClassifyOccurrence } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  occurrence_type: z.enum(['pest', 'disease']),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  province_id: z.string().min(1, 'Selecione uma província'),
  municipality_id: z.string().optional(),
  commune_id: z.string().optional(),
  affected_area_ha: z.coerce.number().min(0).optional(),
  affected_farmers_count: z.coerce.number().min(0).optional(),
  affected_crops: z.string().optional(),
  symptoms: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PhytosanitaryOccurrenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pestTypes = [
  { value: 'lagarta', label: 'Lagarta' },
  { value: 'afideos', label: 'Afídeos' },
  { value: 'mosca', label: 'Mosca da Fruta' },
  { value: 'gafanhoto', label: 'Gafanhoto' },
  { value: 'broca', label: 'Broca' },
  { value: 'acaro', label: 'Ácaro' },
  { value: 'outro', label: 'Outro' },
];

const diseaseTypes = [
  { value: 'ferrugem', label: 'Ferrugem' },
  { value: 'oidio', label: 'Oídio' },
  { value: 'mildio', label: 'Míldio' },
  { value: 'antracnose', label: 'Antracnose' },
  { value: 'podridao', label: 'Podridão' },
  { value: 'murcha', label: 'Murcha' },
  { value: 'outro', label: 'Outra' },
];

export function PhytosanitaryOccurrenceForm({ open, onOpenChange }: PhytosanitaryOccurrenceFormProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [aiClassification, setAiClassification] = useState<any>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const createOccurrence = useCreateOccurrence();
  const classifyOccurrence = useClassifyOccurrence();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      occurrence_type: 'pest',
      description: '',
      province_id: '',
      municipality_id: '',
      commune_id: '',
      affected_area_ha: undefined,
      affected_farmers_count: undefined,
      affected_crops: '',
      symptoms: '',
    },
  });

  const selectedType = form.watch('occurrence_type');
  const selectedProvince = form.watch('province_id');
  const selectedMunicipality = form.watch('municipality_id');
  const description = form.watch('description');

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      const { data } = await supabase
        .from('provinces')
        .select('*')
        .order('name');
      if (data) setProvinces(data);
    };
    fetchProvinces();
  }, []);

  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchMunicipalities = async () => {
        const { data } = await supabase
          .from('municipalities')
          .select('*')
          .eq('province_id', selectedProvince)
          .order('name');
        if (data) setMunicipalities(data);
      };
      fetchMunicipalities();
    } else {
      setMunicipalities([]);
    }
  }, [selectedProvince]);

  // Load communes when municipality changes
  useEffect(() => {
    if (selectedMunicipality) {
      const fetchCommunes = async () => {
        const { data } = await supabase
          .from('communes')
          .select('*')
          .eq('municipality_id', selectedMunicipality)
          .order('name');
        if (data) setCommunes(data);
      };
      fetchCommunes();
    } else {
      setCommunes([]);
    }
  }, [selectedMunicipality]);

  // AI Classification
  const handleClassify = async () => {
    const descValue = form.getValues('description');
    const typeValue = form.getValues('occurrence_type');
    
    if (!descValue || descValue.length < 10) {
      toast.error('Adicione uma descrição mais detalhada para classificação');
      return;
    }

    setIsClassifying(true);
    try {
      const result = await classifyOccurrence.mutateAsync({
        occurrence_type: typeValue,
        description: descValue,
        affected_area_ha: form.getValues('affected_area_ha'),
        affected_farmers_count: form.getValues('affected_farmers_count'),
      });
      setAiClassification(result);
    } catch (error) {
      console.error('Classification error:', error);
    } finally {
      setIsClassifying(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createOccurrence.mutateAsync({
        title: values.title,
        occurrence_type: values.occurrence_type,
        description: values.description,
        province_id: values.province_id || null,
        municipality_id: values.municipality_id || null,
        commune_id: values.commune_id || null,
        affected_area_ha: values.affected_area_ha || null,
        affected_farmers_count: values.affected_farmers_count || null,
        severity: aiClassification?.severity || 'medium',
        status: 'reported',
        source: 'web',
        ai_classification: aiClassification,
        best_practices: aiClassification?.best_practices || [],
      });
      
      form.reset();
      setAiClassification(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating occurrence:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedType === 'pest' ? (
              <Bug className="h-5 w-5 text-destructive" />
            ) : (
              <Leaf className="h-5 w-5 text-warning" />
            )}
            Nova Ocorrência Fitossanitária
          </DialogTitle>
          <DialogDescription>
            Registe uma nova ocorrência de praga ou doença agrícola
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Selection */}
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
                      <SelectItem value="pest">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4" />
                          Praga
                        </div>
                      </SelectItem>
                      <SelectItem value="disease">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          Doença
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Infestação de lagarta do milho" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os sintomas observados, extensão da ocorrência, culturas afectadas..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Quanto mais detalhes, melhor será a classificação automática
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Classification Button */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClassify}
                disabled={isClassifying || !description || description.length < 10}
              >
                {isClassifying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Classificar com IA
              </Button>
              
              {aiClassification && (
                <div className="flex items-center gap-2">
                  <Badge variant={
                    aiClassification.severity === 'critical' || aiClassification.severity === 'high' 
                      ? 'destructive' 
                      : 'secondary'
                  }>
                    Severidade: {aiClassification.severity}
                  </Badge>
                </div>
              )}
            </div>

            {/* AI Classification Results */}
            {aiClassification && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Análise da IA
                </div>
                
                {aiClassification.best_practices && aiClassification.best_practices.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recomendações:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {aiClassification.best_practices.map((practice: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Província</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((p) => (
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
                name="municipality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedProvince}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {municipalities.map((m) => (
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
                name="commune_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedMunicipality}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {communes.map((c) => (
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

            {/* Impact */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="affected_area_ha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Afectada (ha)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} />
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
                    <FormLabel>Agricultores Afectados</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Info */}
            <FormField
              control={form.control}
              name="affected_crops"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Culturas Afectadas</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Milho, Feijão, Mandioca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sintomas Observados</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os sintomas visuais observados nas plantas..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
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
