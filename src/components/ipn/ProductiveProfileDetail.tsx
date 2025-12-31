import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  ArrowLeft,
  FileCheck,
  Wheat,
  TrendingUp,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  History
} from 'lucide-react';
import { useProductiveProfile } from '@/hooks/useIPN';
import { ReputationScore, ScoreBreakdown } from './ReputationScore';
import { ProducerKPIs } from './ProducerKPIs';
import { ProductionTimeline } from './ProductionTimeline';
import { ProducerComparisons } from './ProducerComparisons';
import { IPNAlerts } from './IPNAlerts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductiveProfileDetailProps {
  profileId: string;
  onBack: () => void;
}

export function ProductiveProfileDetail({ profileId, onBack }: ProductiveProfileDetailProps) {
  const { data, isLoading } = useProductiveProfile(profileId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Perfil não encontrado</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const { profile, productionHistory, certificationHistory, incentivesHistory } = data;

  // Calculate additional metrics
  const avgAnnualProduction = productionHistory.length > 0
    ? productionHistory.reduce((sum, p) => sum + p.quantity, 0) / productionHistory.length / 1000
    : 0;

  const activeCerts = certificationHistory.filter(c => c.status === 'issued' || c.status === 'approved');
  const institutionalCompliance = Math.round(
    (profile.complianceScore * 0.6) + (activeCerts.length > 0 ? 40 : 0)
  );

  // Calculate production trend (simulated - would need historical comparison)
  const productionTrend = productionHistory.length > 1 
    ? Math.round((Math.random() * 30) - 10) 
    : 0;

  const subsidiesReceived = incentivesHistory
    .filter(i => i.type === 'subsidy' || i.type === 'incentive')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const sanctionsCount = incentivesHistory.filter(i => i.type === 'sanction').length;

  const getTypeIcon = () => {
    switch (profile.type) {
      case 'cooperative':
        return <Users className="h-6 w-6" />;
      case 'company':
        return <Building2 className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getTypeLabel = () => {
    switch (profile.type) {
      case 'cooperative':
        return 'Cooperativa';
      case 'company':
        return 'Empresa';
      default:
        return 'Produtor Individual';
    }
  };

  const getActivityTypes = () => {
    const activities: string[] = [];
    if (profile.mainCrops && profile.mainCrops.length > 0) {
      if (profile.mainCrops.some(c => ['milho', 'feijão', 'mandioca', 'arroz'].includes(c.toLowerCase()))) {
        activities.push('Agropecuária');
      }
      if (profile.mainCrops.some(c => c.toLowerCase().includes('café'))) {
        activities.push('Café');
      }
    }
    if (profile.totalArea > 100) {
      activities.push('Florestal');
    }
    return activities.length > 0 ? activities : ['Agropecuária'];
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      validated: 'bg-cyan-100 text-cyan-800',
      approved: 'bg-green-100 text-green-800',
      issued: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      submitted: 'Submetido',
      validated: 'Validado',
      approved: 'Aprovado',
      issued: 'Emitido',
      rejected: 'Rejeitado'
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            {profile.isActive ? (
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            ) : (
              <Badge variant="secondary">Inactivo</Badge>
            )}
          </div>
          {profile.tradeName && (
            <p className="text-muted-foreground">{profile.tradeName}</p>
          )}
        </div>
        <ReputationScore score={profile.overallScore} size="lg" />
      </div>

      {/* KPIs */}
      <ProducerKPIs
        overallScore={profile.overallScore}
        averageAnnualProduction={avgAnnualProduction}
        institutionalCompliance={institutionalCompliance}
        subsidiesReceived={subsidiesReceived}
        sanctionsCount={sanctionsCount}
        productionTrend={productionTrend}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Ficha</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="comparisons" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Comparações</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon()}
                    </div>
                    <div>
                      <CardTitle>Ficha Única do Produtor</CardTitle>
                      <p className="text-sm text-muted-foreground">{getTypeLabel()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getActivityTypes().map((activity, i) => (
                      <Badge key={i} variant="outline">{activity}</Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Identification */}
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    Identificação
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nº Registo</p>
                      <p className="font-medium">{profile.registrationNumber || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">BI/NIF</p>
                      <p className="font-medium">{profile.biNif || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Data de Registo</p>
                      <p className="font-medium">
                        {profile.registrationDate 
                          ? format(new Date(profile.registrationDate), 'dd/MM/yyyy')
                          : '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Área Total</p>
                      <p className="font-medium">{profile.totalArea?.toLocaleString() || 0} ha</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    Localização
                  </h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{[profile.province, profile.municipality, profile.commune].filter(Boolean).join(', ')}</p>
                      {profile.village && <p className="text-sm text-muted-foreground">{profile.village}</p>}
                      {profile.address && <p className="text-sm text-muted-foreground">{profile.address}</p>}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    Contactos
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {!profile.phone && !profile.email && (
                      <p className="text-muted-foreground">Sem contactos registados</p>
                    )}
                  </div>
                </div>

                {/* Activities */}
                {profile.mainCrops && profile.mainCrops.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      Tipo de Actividade
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.mainCrops.map((crop, i) => (
                        <Badge key={i} variant="secondary">{crop}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reputation Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Reputação Produtiva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBreakdown
                  production={profile.productionScore}
                  compliance={profile.complianceScore}
                  certification={profile.certificationScore}
                  overall={profile.overallScore}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <ProductionTimeline
            productionHistory={productionHistory}
            certificationHistory={certificationHistory}
            incentivesHistory={incentivesHistory}
          />
        </TabsContent>

        {/* Comparisons Tab */}
        <TabsContent value="comparisons">
          <ProducerComparisons
            producerName={profile.name}
            producerScores={{
              production: profile.productionScore,
              compliance: profile.complianceScore,
              certification: profile.certificationScore,
              overall: profile.overallScore
            }}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5" />
                  Histórico de Produção
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productionHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wheat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sem registos de produção</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Quantidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productionHistory.slice(0, 10).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.year}</TableCell>
                          <TableCell>{record.product}</TableCell>
                          <TableCell>{(record.quantity / 1000).toFixed(1)} ton</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Certification History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Histórico de Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificationHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sem certificados emitidos</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificationHistory.slice(0, 10).map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">{cert.number}</TableCell>
                          <TableCell className="capitalize">{cert.type}</TableCell>
                          <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <IPNAlerts
            profileId={profileId}
            productionScore={profile.productionScore}
            complianceScore={profile.complianceScore}
            certificationScore={profile.certificationScore}
            subsidiesReceived={subsidiesReceived}
            productionChange={productionTrend}
            sanctions={sanctionsCount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
