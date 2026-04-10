import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { ModuleCard } from '@/components/dashboard/ModuleCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RiceOverview } from '@/components/dashboard/RiceOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileCheck,
  TreePine,
  Coffee,
  Wheat,
  CloudRain,
  Building2,
  Map,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Shield,
  Database,
  Coins,
  Activity,
  Target,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sprout,
  Thermometer,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useCertificates } from '@/hooks/useCertificates';
import { useForestLicenses } from '@/hooks/useForestry';
import { useCoffeeLots } from '@/hooks/useCoffee';
import { useOccurrences } from '@/hooks/useOccurrences';
import { useRiceProduction, useRiceImports, useRiceConsumption } from '@/hooks/useRice';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const severityToType = (severity: string): 'critical' | 'warning' | 'info' => {
  if (severity === 'critical' || severity === 'high') return 'critical';
  if (severity === 'medium') return 'warning';
  return 'info';
};

const occurrenceToCategory = (type: string): 'climate' | 'pest' | 'production' | 'market' | 'system' => {
  if (type === 'pest' || type === 'disease') return 'pest';
  return 'climate';
};

const activities = [
  {
    id: '1',
    type: 'certificate' as const,
    action: 'Certificado emitido',
    subject: 'Cooperativa Agrícola do Bailundo',
    user: 'Maria Santos',
    location: 'Huambo',
    time: '10 min',
  },
  {
    id: '2',
    type: 'registration' as const,
    action: 'Novo agricultor registado',
    subject: 'João Pedro Mutemba',
    user: 'Carlos Neto',
    location: 'Bié',
    time: '25 min',
  },
  {
    id: '3',
    type: 'forest' as const,
    action: 'Licença florestal aprovada',
    subject: 'Madeira Angola Lda',
    user: 'António Ferreira',
    location: 'Cabinda',
    time: '1h',
  },
  {
    id: '4',
    type: 'coffee' as const,
    action: 'Lote verificado',
    subject: 'Lote #CF-2024-0892',
    user: 'INCA Verificador',
    location: 'Uíge',
    time: '2h',
  },
  {
    id: '5',
    type: 'rice' as const,
    action: 'Dados de produção actualizados',
    subject: 'Campanha 2024/25',
    user: 'Sistema',
    time: '3h',
  },
];

const provinceStats = [
  { label: 'Huambo', value: '48.250', subValue: 'agricultores' },
  { label: 'Bié', value: '35.120', subValue: 'agricultores' },
  { label: 'Huíla', value: '42.890', subValue: 'agricultores' },
  { label: 'Malanje', value: '28.340', subValue: 'agricultores' },
  { label: 'Cuanza Sul', value: '31.560', subValue: 'agricultores' },
];

export default function Index() {
  // Fetch real data
  const { data: farmers, isLoading: loadingFarmers } = useFarmers();
  const { data: certificates, isLoading: loadingCertificates } = useCertificates();
  const { data: licenses, isLoading: loadingLicenses } = useForestLicenses();
  const { data: coffeeLots, isLoading: loadingCoffee } = useCoffeeLots();
  const { data: occurrences, isLoading: loadingOccurrences } = useOccurrences();
  const { data: riceProduction, isLoading: loadingRice } = useRiceProduction();
  const { data: riceImports } = useRiceImports();
  const { data: riceConsumption } = useRiceConsumption();

  const isLoading = loadingFarmers || loadingCertificates || loadingLicenses || loadingCoffee;

  // Calculate real stats
  const totalFarmers = farmers?.length || 0;
  const totalCooperatives = farmers?.filter(f => f.farmer_type === 'cooperative').length || 0;
  const totalFieldSchools = farmers?.filter(f => f.farmer_type === 'field_school').length || 0;
  const totalCertificates = certificates?.length || 0;
  const pendingCertificates = certificates?.filter(c => c.status === 'submitted' || c.status === 'validated').length || 0;
  const totalLicenses = licenses?.length || 0;
  const activeLicenses = licenses?.filter((l: any) => l.status === 'active').length || 0;
  const totalCoffeeLots = coffeeLots?.length || 0;
  const exportableLots = coffeeLots?.filter((l: any) => l.status === 'exported' || l.status === 'dispatched').length || 0;
  const activeOccurrences = occurrences?.filter(o => o.status !== 'resolved').length || 0;
  const resolvedOccurrences = occurrences?.filter(o => o.status === 'resolved').length || 0;

  // Rice stats
  const totalRiceProduction = riceProduction?.reduce((sum, p) => sum + Number(p.production_tonnes), 0) || 0;
  const totalRiceImports = riceImports?.reduce((sum, i) => sum + Number(i.volume_tonnes), 0) || 0;
  const riceGap = riceConsumption?.[0]?.total_consumption_tonnes 
    ? Math.max(0, riceConsumption[0].total_consumption_tonnes - totalRiceProduction) 
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Module categories
  const coreModules = [
    {
      title: 'Gestão de Agricultores',
      description: 'Registo, escolas de campo e cooperativas agrícolas',
      icon: <Users className="h-5 w-5" />,
      href: '/agricultores',
      stats: [
        { label: 'registados', value: formatNumber(totalFarmers) },
        { label: 'cooperativas', value: formatNumber(totalCooperatives) },
      ],
      status: 'active' as const,
    },
    {
      title: 'Certificados',
      description: 'Emissão e verificação de certificados de produção',
      icon: <FileCheck className="h-5 w-5" />,
      href: '/certificados',
      stats: [
        { label: 'emitidos', value: formatNumber(totalCertificates) },
        { label: 'pendentes', value: formatNumber(pendingCertificates) },
      ],
      status: 'active' as const,
    },
    {
      title: 'Histórico de Produção',
      description: 'Registos de produção agrícola por campanha',
      icon: <Sprout className="h-5 w-5" />,
      href: '/producao',
      stats: [
        { label: 'campanhas', value: '5' },
        { label: 'culturas', value: '12' },
      ],
      status: 'active' as const,
    },
    {
      title: 'Ocorrências Climáticas',
      description: 'Monitorização de eventos climáticos e fitossanitários',
      icon: <CloudRain className="h-5 w-5" />,
      href: '/ocorrencias/climaticas',
      stats: [
        { label: 'activas', value: formatNumber(activeOccurrences) },
        { label: 'resolvidas', value: formatNumber(resolvedOccurrences) },
      ],
      status: 'active' as const,
    },
  ];

  const sectorModules = [
    {
      title: 'Gestão Florestal',
      description: 'Licenciamento, rastreabilidade e fiscalização',
      icon: <TreePine className="h-5 w-5" />,
      href: '/florestal',
      stats: [
        { label: 'licenças', value: formatNumber(totalLicenses) },
        { label: 'activas', value: formatNumber(activeLicenses) },
      ],
      status: 'active' as const,
    },
    {
      title: 'Cadeia do Café',
      description: 'Rastreio por lote e sistema de semaforização',
      icon: <Coffee className="h-5 w-5" />,
      href: '/cafe',
      stats: [
        { label: 'lotes', value: formatNumber(totalCoffeeLots) },
        { label: 'exportáveis', value: formatNumber(exportableLots) },
      ],
      status: 'active' as const,
    },
    {
      title: 'Gestão do Arroz',
      description: 'Módulo estratégico de soberania alimentar',
      icon: <Wheat className="h-5 w-5" />,
      href: '/arroz',
      stats: [
        { label: 'produção', value: `${formatNumber(totalRiceProduction)} t` },
        { label: 'gap', value: `${formatNumber(riceGap)} t` },
      ],
      status: 'active' as const,
    },
    {
      title: 'Infra-estruturas',
      description: 'Gestão de activos agropecuários e mercados',
      icon: <Building2 className="h-5 w-5" />,
      href: '/infraestruturas/agropecuarias',
      stats: [
        { label: 'registadas', value: '4.5K' },
        { label: 'mercados', value: '892' },
      ],
      status: 'active' as const,
    },
  ];

  const analyticsModules = [
    {
      title: 'ONAF',
      description: 'Observatório Nacional de Alerta Fitossanitário',
      icon: <Activity className="h-5 w-5" />,
      href: '/onaf',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'IPN',
      description: 'Identidade Produtiva Nacional',
      icon: <Target className="h-5 w-5" />,
      href: '/ipn',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Risco Climático',
      description: 'Análise de vulnerabilidade climática',
      icon: <Thermometer className="h-5 w-5" />,
      href: '/risco-climatico',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Incentivos',
      description: 'Gestão de programas e subsídios',
      icon: <Coins className="h-5 w-5" />,
      href: '/incentivos',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Crédito & Seguro',
      description: 'Perfis financeiros e seguros agrícolas',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/credito-seguro',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Laboratório de Dados',
      description: 'Análises avançadas para investigadores',
      icon: <Database className="h-5 w-5" />,
      href: '/laboratorio-dados',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <MainLayout 
      title="Painel Principal" 
      subtitle="Sistema Integrado de Gestão Agropecuária e Florestal"
    >
      <div className="space-y-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Badge variant="secondary" className="gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                A carregar dados...
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 border-success/50 bg-success/10 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sistema operacional
              </Badge>
            )}
            {activeOccurrences > 0 && (
              <Badge variant="outline" className="gap-1.5 border-warning/50 bg-warning/10 text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                {activeOccurrences} ocorrências activas
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/verificar">
                <ExternalLink className="mr-2 h-4 w-4" />
                Portal Público
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Agricultores Registados"
            value={formatNumber(totalFarmers)}
            subtitle="Em todo o território nacional"
            change={8.5}
            changeType="increase"
            icon={<Users className="h-5 w-5" />}
            variant="primary"
            className="animate-fade-in stagger-1"
          />
          <KPICard
            title="Certificados Emitidos"
            value={formatNumber(totalCertificates)}
            subtitle="Ano corrente"
            change={23.2}
            changeType="increase"
            icon={<FileCheck className="h-5 w-5" />}
            variant="success"
            className="animate-fade-in stagger-2"
          />
          <KPICard
            title="Licenças Florestais"
            value={formatNumber(totalLicenses)}
            subtitle={`${formatNumber(activeLicenses)} activas`}
            change={-5.1}
            changeType="decrease"
            icon={<TreePine className="h-5 w-5" />}
            variant="accent"
            className="animate-fade-in stagger-3"
          />
          <KPICard
            title="Lotes de Café"
            value={formatNumber(totalCoffeeLots)}
            subtitle="Em rastreio"
            change={15.8}
            changeType="increase"
            icon={<Coffee className="h-5 w-5" />}
            variant="warning"
            className="animate-fade-in stagger-4"
          />
        </section>

        {/* Rice Strategic Module */}
        <section className="animate-fade-in stagger-5">
          <RiceOverview />
        </section>

        {/* Main Content Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Modules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Módulos Principais
                </h2>
                <Badge variant="secondary">{coreModules.length} módulos</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {coreModules.map((module) => (
                  <ModuleCard key={module.title} {...module} />
                ))}
              </div>
            </div>

            {/* Sector Modules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Módulos Sectoriais
                </h2>
                <Badge variant="secondary">{sectorModules.length} módulos</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {sectorModules.map((module) => (
                  <ModuleCard key={module.title} {...module} />
                ))}
              </div>
            </div>

            {/* Analytics & Intelligence Modules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Análise & Inteligência
                </h2>
                <Badge variant="secondary">{analyticsModules.length} módulos</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {analyticsModules.map((module) => (
                  <Link key={module.title} to={module.href}>
                    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className={`rounded-lg p-2.5 ${module.bgColor}`}>
                          <div className={module.color}>{module.icon}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-foreground truncate">{module.title}</p>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{module.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <AlertsPanel alerts={alerts} />
            <QuickStats title="Por Província" stats={provinceStats} />
            
            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Acesso Rápido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/agricultores/novo" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors">
                  <span className="text-muted-foreground">Novo agricultor</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link to="/certificados/novo" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors">
                  <span className="text-muted-foreground">Novo certificado</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link to="/ocorrencias/climaticas" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors">
                  <span className="text-muted-foreground">Reportar ocorrência</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link to="/arroz/producao" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors">
                  <span className="text-muted-foreground">Registar produção arroz</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="grid gap-6 lg:grid-cols-2">
          <RecentActivity activities={activities} />
          
          {/* Map Preview */}
          <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Mapa de Cobertura</h3>
              </div>
              <Link to="/risco-climatico" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver mapa de risco <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Map className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Mapa interactivo de Angola
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Visualização georreferenciada de dados agrícolas
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Link to="/risco-climatico-analytics">
                      <Button variant="outline" size="sm">
                        Análise Climática
                      </Button>
                    </Link>
                    <Link to="/incentivos-analytics">
                      <Button variant="outline" size="sm">
                        Mapa Incentivos
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
