import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Leaf,
  CloudRain,
  Shield,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { 
  useFinancialProfile, 
  useCalculateFinancialProfile,
  useCreditSimulations,
  useProductionCertificates,
  useInsuranceRiskScores,
  useAlternativeGuarantees
} from '@/hooks/useCreditInsurance';
import { useFarmer } from '@/hooks/useFarmers';
import { toast } from 'sonner';

interface Props {
  farmerId: string;
  onBack: () => void;
}

export function FarmerFinancialProfileDetail({ farmerId, onBack }: Props) {
  const { data: profile, isLoading, refetch } = useFinancialProfile(farmerId);
  const { data: farmer } = useFarmer(farmerId);
  const { data: simulations } = useCreditSimulations(farmerId);
  const { data: certificates } = useProductionCertificates(farmerId);
  const { data: insuranceScores } = useInsuranceRiskScores(farmerId);
  const { data: guarantees } = useAlternativeGuarantees(farmerId);
  
  const calculateProfile = useCalculateFinancialProfile();

  const handleRecalculate = async () => {
    try {
      await calculateProfile.mutateAsync(farmerId);
      toast.success('Perfil recalculado com sucesso');
      refetch();
    } catch (e) {
      toast.error('Erro ao recalcular perfil');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBadge = (classification: string) => {
    switch (classification) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Risco Baixo</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Risco Médio</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Risco Alto</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Carregando perfil...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{farmer?.name || 'Agricultor'}</h2>
            <p className="text-muted-foreground">
              {farmer?.registration_number} • {farmer?.provinces?.name}
            </p>
          </div>
        </div>
        <Button onClick={handleRecalculate} disabled={calculateProfile.isPending}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalcular
        </Button>
      </div>

      {/* Credit Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold ${getScoreColor(profile?.credit_score || 0)}`}>
                {profile?.credit_score || 0}
              </div>
              <p className="mt-2 text-sm font-medium">Score de Crédito</p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Classificação de Risco</span>
                {getRiskBadge(profile?.risk_classification || 'medium')}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {profile?.is_credit_eligible ? (
                    <Badge className="bg-green-100 text-green-800">Elegível para Crédito</Badge>
                  ) : (
                    <Badge variant="destructive">Não Elegível para Crédito</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {profile?.is_insurance_eligible ? (
                    <Badge className="bg-green-100 text-green-800">Elegível para Seguro</Badge>
                  ) : (
                    <Badge variant="destructive">Não Elegível para Seguro</Badge>
                  )}
                </div>
              </div>

              {profile?.eligibility_notes && (
                <p className="text-sm text-muted-foreground">{profile.eligibility_notes}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Factores do Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile?.credit_score_factors && Object.entries(profile.credit_score_factors).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{key.replace('_', ' ')}</span>
                  <span className={Number(value) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Number(value) >= 0 ? '+' : ''}{value} pts
                  </span>
                </div>
                <Progress 
                  value={Math.abs(Number(value)) * 5} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">
            <Leaf className="h-4 w-4 mr-2" />
            Produção
          </TabsTrigger>
          <TabsTrigger value="climate">
            <CloudRain className="h-4 w-4 mr-2" />
            Clima
          </TabsTrigger>
          <TabsTrigger value="simulations">
            <CreditCard className="h-4 w-4 mr-2" />
            Simulações
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Anos de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.production_years || 0}</div>
                <p className="text-xs text-muted-foreground">Histórico registado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estabilidade Produtiva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.production_stability_pct?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">Variação média</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Área Produtiva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.productive_area_ha || 0} ha</div>
                <p className="text-xs text-muted-foreground">Área cultivada</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Culturas Principais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.main_crops?.map((crop: string) => (
                  <Badge key={crop} variant="secondary">{crop}</Badge>
                )) || <span className="text-muted-foreground">Nenhuma cultura registada</span>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="climate">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Eventos Climáticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.climate_events_count || 0}</div>
                <p className="text-xs text-muted-foreground">Na região</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risco Territorial</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={
                  profile?.territorial_risk_level === 'low' ? 'default' :
                  profile?.territorial_risk_level === 'high' ? 'destructive' : 'secondary'
                }>
                  {profile?.territorial_risk_level === 'low' ? 'Baixo' :
                   profile?.territorial_risk_level === 'medium' ? 'Médio' :
                   profile?.territorial_risk_level === 'high' ? 'Alto' : 'Muito Alto'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulations">
          <Card>
            <CardContent className="pt-6">
              {simulations && simulations.length > 0 ? (
                <div className="space-y-4">
                  {simulations.slice(0, 3).map((sim) => (
                    <div key={sim.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {sim.scenario_type === 'normal' ? 'Normal' :
                             sim.scenario_type === 'adverse' ? 'Adverso' : 'Optimista'}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{sim.simulation_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(sim.recommended_credit_amount_aoa)}</p>
                          <p className="text-xs text-muted-foreground">Crédito recomendado</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma simulação realizada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Certificados de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                {certificates && certificates.length > 0 ? (
                  <div className="space-y-2">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{cert.certificate_number}</span>
                        <Badge variant={cert.status === 'issued' ? 'default' : 'secondary'}>
                          {cert.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhum certificado emitido</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Garantias Alternativas</CardTitle>
              </CardHeader>
              <CardContent>
                {guarantees && guarantees.length > 0 ? (
                  <div className="space-y-2">
                    {guarantees.map((g) => (
                      <div key={g.id} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm truncate">{g.description}</span>
                        <span className="text-sm font-medium">{formatCurrency(g.estimated_value_aoa)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhuma garantia registada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
