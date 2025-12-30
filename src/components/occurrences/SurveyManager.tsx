import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, Send, Loader2, Users, CheckCircle, Clock, Phone } from 'lucide-react';
import { useCreateSurvey, useOccurrenceSurveys } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';

const surveyTypes = [
  { value: 'impact_assessment', label: 'Avaliação de Impacto', icon: '📊' },
  { value: 'damage_report', label: 'Relatório de Danos', icon: '📝' },
  { value: 'recovery_status', label: 'Estado de Recuperação', icon: '🔄' },
  { value: 'needs_assessment', label: 'Avaliação de Necessidades', icon: '📋' },
];

const samplePhones = [
  '+244 923 111 222',
  '+244 923 333 444',
  '+244 923 555 666',
  '+244 923 777 888',
  '+244 923 999 000',
];

export function SurveyManager() {
  const [surveyType, setSurveyType] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);

  const createSurvey = useCreateSurvey();
  const { data: surveys } = useOccurrenceSurveys();

  useEffect(() => {
    async function fetchProvinces() {
      const { data } = await supabase.from('provinces').select('*').order('name');
      if (data) setProvinces(data);
    }
    fetchProvinces();
  }, []);

  const handleCreateSurvey = async () => {
    if (!surveyType) return;

    try {
      await createSurvey.mutateAsync({
        survey_type: surveyType,
        target_phones: samplePhones,
        province_id: selectedProvince || undefined,
      });
      setSurveyType('');
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const completedSurveys = surveys?.filter((s) => s.status === 'completed').length || 0;
  const pendingSurveys = surveys?.filter((s) => s.status === 'pending' || s.status === 'sent').length || 0;
  const totalSurveys = surveys?.length || 0;
  const completionRate = totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Inquéritos SMS/IVR
        </CardTitle>
        <CardDescription>
          Crie e gerencie inquéritos automáticos para agricultores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create Survey */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Inquérito</label>
              <Select value={surveyType} onValueChange={setSurveyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {surveyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Província (Opcional)</label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as províncias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as províncias</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCreateSurvey}
            disabled={!surveyType || createSurvey.isPending}
            className="w-full"
          >
            {createSurvey.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Criar e Enviar Inquérito ({samplePhones.length} destinatários)
          </Button>
        </div>

        {/* Survey Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{totalSurveys}</div>
            <div className="text-xs text-muted-foreground">Total Enviados</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedSurveys}</div>
            <div className="text-xs text-muted-foreground">Respondidos</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingSurveys}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Taxa de Resposta</span>
            <span className="font-medium">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Recent Surveys */}
        {surveys && surveys.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Inquéritos Recentes</span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {surveys.slice(0, 5).map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      {surveyTypes.find((t) => t.value === survey.survey_type)?.icon || '📋'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {surveyTypes.find((t) => t.value === survey.survey_type)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {survey.target_phone}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      survey.status === 'completed'
                        ? 'default'
                        : survey.status === 'sent'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {survey.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {survey.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {survey.status === 'sent' && <Users className="h-3 w-3 mr-1" />}
                    {survey.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
