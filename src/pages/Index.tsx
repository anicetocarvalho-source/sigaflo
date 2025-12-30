import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { ModuleCard } from '@/components/dashboard/ModuleCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RiceOverview } from '@/components/dashboard/RiceOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Users,
  FileCheck,
  TreePine,
  Coffee,
  Wheat,
  CloudRain,
  Building2,
  Map,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const alerts = [
  {
    id: '1',
    type: 'critical' as const,
    category: 'climate' as const,
    title: 'Seca severa detectada - Risco de perda de colheita',
    location: 'Huíla, Matala',
    time: 'Há 2 horas',
  },
  {
    id: '2',
    type: 'warning' as const,
    category: 'pest' as const,
    title: 'Surto de lagarta-do-cartucho identificado',
    location: 'Malanje, Cacuso',
    time: 'Há 5 horas',
  },
  {
    id: '3',
    type: 'warning' as const,
    category: 'production' as const,
    title: 'Produção de arroz abaixo da meta provincial',
    location: 'Cuanza Sul',
    time: 'Há 8 horas',
  },
  {
    id: '4',
    type: 'info' as const,
    category: 'system' as const,
    title: 'Novo lote de café aprovado para exportação',
    location: 'Uíge',
    time: 'Há 12 horas',
  },
];

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
  return (
    <MainLayout 
      title="Painel Principal" 
      subtitle="Sistema Integrado de Gestão Agropecuária e Florestal"
    >
      <div className="space-y-6">
        {/* Hero KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Agricultores Registados"
            value="892.450"
            subtitle="Em todo o território nacional"
            change={8.5}
            changeType="increase"
            icon={<Users className="h-5 w-5" />}
            variant="primary"
            className="animate-fade-in stagger-1"
          />
          <KPICard
            title="Certificados Emitidos"
            value="45.230"
            subtitle="Ano corrente"
            change={23.2}
            changeType="increase"
            icon={<FileCheck className="h-5 w-5" />}
            variant="success"
            className="animate-fade-in stagger-2"
          />
          <KPICard
            title="Licenças Florestais"
            value="1.892"
            subtitle="Activas"
            change={-5.1}
            changeType="decrease"
            icon={<TreePine className="h-5 w-5" />}
            variant="accent"
            className="animate-fade-in stagger-3"
          />
          <KPICard
            title="Lotes de Café"
            value="12.340"
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
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Módulos do Sistema
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ModuleCard
                title="Gestão de Agricultores"
                description="Registo, escolas de campo e cooperativas agrícolas"
                icon={<Users className="h-5 w-5" />}
                href="/agricultores"
                stats={[
                  { label: 'registados', value: '892K' },
                  { label: 'cooperativas', value: '2.4K' },
                ]}
                status="active"
              />
              <ModuleCard
                title="Certificados"
                description="Emissão e verificação de certificados de produção"
                icon={<FileCheck className="h-5 w-5" />}
                href="/certificados"
                stats={[
                  { label: 'emitidos', value: '45.2K' },
                  { label: 'pendentes', value: '892' },
                ]}
                status="active"
              />
              <ModuleCard
                title="Ocorrências Climáticas"
                description="Monitorização de eventos climáticos e fitossanitários"
                icon={<CloudRain className="h-5 w-5" />}
                href="/ocorrencias/climaticas"
                stats={[
                  { label: 'activas', value: '23' },
                  { label: 'resolvidas', value: '156' },
                ]}
                status="active"
              />
              <ModuleCard
                title="Gestão Florestal"
                description="Licenciamento, rastreabilidade e fiscalização"
                icon={<TreePine className="h-5 w-5" />}
                href="/florestal/licenciamento"
                stats={[
                  { label: 'licenças', value: '1.9K' },
                  { label: 'fiscalizações', value: '342' },
                ]}
                status="active"
              />
              <ModuleCard
                title="Cadeia do Café"
                description="Rastreio por lote e sistema de semaforização"
                icon={<Coffee className="h-5 w-5" />}
                href="/cafe/rastreio"
                stats={[
                  { label: 'lotes', value: '12.3K' },
                  { label: 'exportáveis', value: '8.9K' },
                ]}
                status="active"
              />
              <ModuleCard
                title="Gestão do Arroz"
                description="Módulo estratégico de soberania alimentar"
                icon={<Wheat className="h-5 w-5" />}
                href="/arroz"
                stats={[
                  { label: 'produção', value: '892K t' },
                  { label: 'gap', value: '352K t' },
                ]}
                status="active"
              />
              <ModuleCard
                title="Infra-estruturas"
                description="Gestão de activos agropecuários e mercados"
                icon={<Building2 className="h-5 w-5" />}
                href="/infraestruturas"
                stats={[
                  { label: 'registadas', value: '4.5K' },
                  { label: 'mercados', value: '892' },
                ]}
                status="active"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <AlertsPanel alerts={alerts} />
            <QuickStats title="Por Província" stats={provinceStats} />
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
              <a href="/mapas" className="text-sm text-primary hover:underline">
                Abrir mapa
              </a>
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
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
