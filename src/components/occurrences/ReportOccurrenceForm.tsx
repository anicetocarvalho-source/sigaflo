import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Bell,
  Send,
  Sun,
  Droplets,
  Bug,
  Flame,
  Snowflake,
  HelpCircle
} from 'lucide-react';
import { useCreateOccurrence } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  description: z.string()
    .min(20, 'Descreva a situação com pelo menos 20 caracteres')
    .max(2000, 'Descrição muito longa'),
  province_id: z.string().min(1, 'Selecione a província'),
  municipality_id: z.string().optional(),
  commune_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReportOccurrenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons: Record<string, any> = {
  drought: Sun,
  flood: Droplets,
  pest: Bug,
  disease: AlertTriangle,
  frost: Snowflake,
  fire: Flame,
  hail: Droplets,
  other: HelpCircle,
};

const typeLabels: Record<string, string> = {
  drought: 'Seca',
  flood: 'Inundação',
  pest: 'Praga',
  disease: 'Doença',
  frost: 'Geada',
  fire: 'Incêndio',
  hail: 'Granizo',
  other: 'Outro',
};

const severityConfig: Record<string, { label: string; color: string; textColor: string }> = {
  low: { label: 'Baixa', color: 'bg-green-500/10', textColor: 'text-green-600' },
  medium: { label: 'Média', color: 'bg-yellow-500/10', textColor: 'text-yellow-600' },
  high: { label: 'Alta', color: 'bg-orange-500/10', textColor: 'text-orange-600' },
  critical: { label: 'Crítica', color: 'bg-red-500/10', textColor: 'text-red-600' },
};

export function ReportOccurrenceForm({ open, onOpenChange }: ReportOccurrenceFormProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    type: string;
    severity: string;
    confidence: number;
    title: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const createOccurrence = useCreateOccurrence();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      province_id: '',
      municipality_id: '',
      commune_id: '',
    },
  });

  const selectedProvinceId = form.watch('province_id');
  const selectedMunicipalityId = form.watch('municipality_id');
  const description = form.watch('description');

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');
      if (!error && data) setProvinces(data);
    };
    loadProvinces();
  }, []);

  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      const loadMunicipalities = async () => {
        const { data, error } = await supabase
          .from('municipalities')
          .select('id, name')
          .eq('province_id', selectedProvinceId)
          .order('name');
        if (!error && data) setMunicipalities(data);
      };
      loadMunicipalities();
      form.setValue('municipality_id', '');
      form.setValue('commune_id', '');
    } else {
      setMunicipalities([]);
      setCommunes([]);
    }
  }, [selectedProvinceId]);

  // Load communes when municipality changes
  useEffect(() => {
    if (selectedMunicipalityId) {
      const loadCommunes = async () => {
        const { data, error } = await supabase
          .from('communes')
          .select('id, name')
          .eq('municipality_id', selectedMunicipalityId)
          .order('name');
        if (!error && data) setCommunes(data);
      };
      loadCommunes();
      form.setValue('commune_id', '');
    } else {
      setCommunes([]);
    }
  }, [selectedMunicipalityId]);

  // Auto-analyze with AI when description is long enough
  useEffect(() => {
    const analyzeWithAI = async () => {
      if (description.length >= 30 && !isAnalyzing) {
        setIsAnalyzing(true);
        try {
          const { data, error } = await supabase.functions.invoke('report-occurrence-ai', {
            body: { description, action: 'analyze' }
          });

          if (error) throw error;

          if (data?.analysis) {
            setAiResult(data.analysis);
          }
        } catch (error) {
          console.error('AI analysis error:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    const debounce = setTimeout(analyzeWithAI, 1000);
    return () => clearTimeout(debounce);
  }, [description]);

  const onSubmit = async (values: FormValues) => {
    if (!aiResult) {
      toast.error('Aguarde a análise automática da ocorrência');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the occurrence
      await createOccurrence.mutateAsync({
        title: aiResult.title,
        occurrence_type: aiResult.type,
        description: values.description,
        severity: aiResult.severity,
        province_id: values.province_id,
        municipality_id: values.municipality_id || null,
        source: 'app',
        status: 'reported',
        ai_classification: {
          type: aiResult.type,
          severity: aiResult.severity,
          confidence: aiResult.confidence,
          auto_detected: true
        }
      });

      // Notify technicians
      const { data: notifyData, error: notifyError } = await supabase.functions.invoke('report-occurrence-ai', {
        body: { 
          action: 'notify',
          occurrence_type: aiResult.type,
          severity: aiResult.severity,
          province_id: values.province_id,
          title: aiResult.title
        }
      });

      if (!notifyError && notifyData?.notified) {
        setNotificationSent(true);
        toast.success(`Ocorrência reportada! ${notifyData.technicians_notified} técnicos notificados.`);
      } else {
        toast.success('Ocorrência reportada com sucesso!');
      }

      // Reset form
      form.reset();
      setAiResult(null);
      setNotificationSent(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Erro ao reportar ocorrência: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TypeIcon = aiResult?.type ? typeIcons[aiResult.type] || HelpCircle : null;
  const severity = aiResult?.severity ? severityConfig[aiResult.severity] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Reportar Ocorrência
          </DialogTitle>
          <DialogDescription>
            Descreva a situação e o sistema irá classificar automaticamente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Description - Free Text */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que está a acontecer?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva a situação em detalhe. Ex: 'As plantas de milho estão a murchar devido à falta de chuva há 3 semanas. A área afectada é de aproximadamente 50 hectares e cerca de 20 agricultores estão impactados.'"
                      className="min-h-[120px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{description.length}/2000 caracteres</span>
                    {isAnalyzing && (
                      <span className="flex items-center gap-1 text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        A analisar...
                      </span>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* AI Detection Result */}
            {aiResult && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Detecção Automática</span>
                    <Badge variant="outline" className="text-xs">
                      {(aiResult.confidence * 100).toFixed(0)}% confiança
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                      {TypeIcon && <TypeIcon className="h-5 w-5 text-primary" />}
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="font-medium text-sm">{typeLabels[aiResult.type] || aiResult.type}</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${severity?.color}`}>
                      <AlertTriangle className={`h-5 w-5 ${severity?.textColor}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">Urgência</p>
                        <p className={`font-medium text-sm ${severity?.textColor}`}>
                          {severity?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-2 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Título sugerido</p>
                    <p className="text-sm font-medium">{aiResult.title}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Província
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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

              <FormField
                control={form.control}
                name="municipality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedProvinceId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {municipalities.map((mun) => (
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

              <FormField
                control={form.control}
                name="commune_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedMunicipalityId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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

            {/* Notification Info */}
            {aiResult && aiResult.severity !== 'low' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <Bell className="h-4 w-4 text-primary" />
                <span>
                  Técnicos da região serão notificados automaticamente sobre esta ocorrência.
                </span>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !aiResult || isAnalyzing}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Reportar Ocorrência
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
