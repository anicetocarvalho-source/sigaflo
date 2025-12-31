import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Ruler,
  AlertTriangle,
  Sun,
  Droplets,
  Bug,
  ThermometerSun,
  MessageSquare,
  Smartphone,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
  Banknote,
  Sparkles,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useOccurrence } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

const occurrenceTypes = {
  drought: { label: 'Seca', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  flood: { label: 'Inundação', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  pest: { label: 'Praga', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  disease: { label: 'Doença', icon: AlertTriangle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  frost: { label: 'Geada', icon: ThermometerSun, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  hail: { label: 'Granizo', icon: Droplets, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  fire: { label: 'Incêndio', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  other: { label: 'Outro', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

const severityConfig = {
  critical: { label: 'Crítico', color: 'bg-red-600 text-white' },
  high: { label: 'Alto', color: 'bg-orange-500 text-white' },
  medium: { label: 'Médio', color: 'bg-yellow-500 text-white' },
  low: { label: 'Baixo', color: 'bg-green-500 text-white' },
};

const statusTypes = {
  reported: { label: 'Reportada', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
  investigating: { label: 'Em Investigação', icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed: { label: 'Confirmada', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  mitigating: { label: 'Em Mitigação', icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50' },
  resolved: { label: 'Resolvida', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  closed: { label: 'Encerrada', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
};

const sourceTypes = {
  sms: { label: 'SMS', icon: MessageSquare },
  app: { label: 'Aplicação', icon: Smartphone },
  technician: { label: 'Técnico', icon: User },
  web: { label: 'Portal Web', icon: Smartphone },
};

export default function OccurrenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: occurrence, isLoading } = useOccurrence(id);
  
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Fetch AI recommendations
  const fetchAIRecommendations = async () => {
    if (!occurrence) return;
    
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('occurrence-ai-recommendations', {
        body: { 
          occurrence_type: occurrence.occurrence_type,
          severity: occurrence.severity,
          description: occurrence.description,
          affected_area_ha: occurrence.affected_area_ha,
          affected_farmers_count: occurrence.affected_farmers_count,
          estimated_loss_aoa: occurrence.estimated_loss_aoa,
          location: occurrence.provinces?.name
        }
      });

      if (error) throw error;
      
      if (data?.recommendations) {
        setAiRecommendations(data.recommendations);
      }
    } catch (error: any) {
      console.error('Error fetching AI recommendations:', error);
      // Fallback to existing best practices if AI fails
      if (occurrence.best_practices?.length) {
        setAiRecommendations(occurrence.best_practices);
      } else {
        toast.error('Erro ao obter recomendações IA');
      }
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (occurrence) {
      // Use existing best practices initially
      if (occurrence.best_practices?.length) {
        setAiRecommendations(occurrence.best_practices);
      }
      // Then try to get AI recommendations
      fetchAIRecommendations();
    }
  }, [occurrence?.id]);

  if (isLoading) {
    return (
      <MainLayout title="Detalhe da Ocorrência" subtitle="Carregando...">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!occurrence) {
    return (
      <MainLayout title="Ocorrência não encontrada" subtitle="">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">A ocorrência solicitada não foi encontrada.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/ocorrencias/climaticas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  const typeConfig = occurrenceTypes[occurrence.occurrence_type as keyof typeof occurrenceTypes] || occurrenceTypes.other;
  const severity = severityConfig[occurrence.severity as keyof typeof severityConfig] || severityConfig.medium;
  const status = statusTypes[occurrence.status as keyof typeof statusTypes] || statusTypes.reported;
  const source = sourceTypes[occurrence.source as keyof typeof sourceTypes] || sourceTypes.app;
  const TypeIcon = typeConfig.icon;
  const StatusIcon = status.icon;
  const SourceIcon = source.icon;

  return (
    <MainLayout 
      title="Detalhe da Ocorrência" 
      subtitle={occurrence.title}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/ocorrencias/climaticas')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à lista
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${typeConfig.bg}`}>
                  <TypeIcon className={`h-8 w-8 ${typeConfig.color}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{occurrence.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(occurrence.report_date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={severity.color}>
                  {severity.label}
                </Badge>
                <Badge variant="outline" className={`${status.bg} ${status.color} border-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                <Badge variant="outline">
                  <SourceIcon className="h-3 w-3 mr-1" />
                  {source.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {occurrence.description || 'Sem descrição disponível.'}
              </p>
              
              {occurrence.resolution_notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notas de Resolução:</p>
                  <p className="text-sm">{occurrence.resolution_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Província</span>
                <span className="font-medium">{occurrence.provinces?.name || 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Município</span>
                <span className="font-medium">{occurrence.municipalities?.name || 'N/A'}</span>
              </div>
              {(occurrence.latitude && occurrence.longitude) && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coordenadas</span>
                    <span className="font-mono text-sm">
                      {occurrence.latitude?.toFixed(4)}, {occurrence.longitude?.toFixed(4)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Impacto Estimado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Impacto Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">
                    {occurrence.affected_area_ha?.toLocaleString() || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Hectares afectados</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Banknote className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">
                    {occurrence.estimated_loss_aoa 
                      ? `${(occurrence.estimated_loss_aoa / 1000000).toFixed(1)}M`
                      : '—'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Perdas (AOA)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agricultores Afectados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Agricultores Afectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {occurrence.affected_farmers_count?.toLocaleString() || '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Agricultores impactados por esta ocorrência
                  </p>
                </div>
              </div>
              
              {occurrence.affected_farmers_count && occurrence.affected_farmers_count > 50 && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm text-warning flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Grande número de agricultores afectados - prioridade alta
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações Recomendadas (IA) */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Ações Recomendadas (IA)
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAIRecommendations}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Actualizar</span>
              </Button>
            </div>
            <CardDescription>
              Recomendações geradas por inteligência artificial com base no tipo e severidade da ocorrência
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingAI && aiRecommendations.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="space-y-3">
                {aiRecommendations.map((recommendation, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground">{recommendation}</p>
                    </div>
                    <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Sem recomendações disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Classification Info */}
        {occurrence.ai_classification && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classificação Automática</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Severidade Detectada</p>
                  <p className="font-medium capitalize">{occurrence.ai_classification.severity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confiança</p>
                  <p className="font-medium">{(occurrence.ai_classification.confidence * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Raciocínio</p>
                  <p className="text-sm">{occurrence.ai_classification.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
