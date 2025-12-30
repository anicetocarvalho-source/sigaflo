import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from '@/components/dashboard/KPICard';
import { LicensesList } from '@/components/forestry/LicensesList';
import { LicenseForm } from '@/components/forestry/LicenseForm';
import { TraceabilityDashboard } from '@/components/forestry/TraceabilityDashboard';
import { useForestryStats, type ForestLicense } from '@/hooks/useForestry';
import {
  TreePine,
  FileCheck,
  Truck,
  AlertTriangle,
  Sprout,
  MapPin,
  Megaphone,
  BarChart3,
  Trees,
} from 'lucide-react';

export default function ForestryPage() {
  const [activeTab, setActiveTab] = useState('licenses');
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<ForestLicense | null>(null);
  
  const { data: stats, isLoading: statsLoading } = useForestryStats();

  const handleViewLicense = (license: ForestLicense) => {
    setSelectedLicense(license);
    setShowLicenseForm(true);
  };

  const handleEditLicense = (license: ForestLicense) => {
    setSelectedLicense(license);
    setShowLicenseForm(true);
  };

  const handleCloseLicenseForm = () => {
    setShowLicenseForm(false);
    setSelectedLicense(null);
  };

  return (
    <MainLayout
      title="Gestão Florestal"
      subtitle="Licenciamento, rastreabilidade e fiscalização da cadeia da madeira"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Licenças Activas"
            value={statsLoading ? '...' : stats?.activeLicenses.toLocaleString() || '0'}
            subtitle="Em todo o território"
            icon={<FileCheck className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Volume Autorizado"
            value={statsLoading ? '...' : (stats?.totalAuthorizedVolume.toLocaleString() || '0')}
            subtitle="m³ / ano"
            icon={<TreePine className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Transportes Activos"
            value={statsLoading ? '...' : stats?.activeTransports.toLocaleString() || '0'}
            subtitle="Em trânsito"
            icon={<Truck className="h-5 w-5" />}
            variant="accent"
          />
          <KPICard
            title="Infrações Pendentes"
            value={statsLoading ? '...' : stats?.pendingInfractions.toLocaleString() || '0'}
            subtitle="A processar"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="warning"
          />
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="licenses" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Licenças</span>
            </TabsTrigger>
            <TabsTrigger value="traceability" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Rastreio</span>
            </TabsTrigger>
            <TabsTrigger value="infractions" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Infrações</span>
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Denúncias</span>
            </TabsTrigger>
            <TabsTrigger value="nurseries" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              <span className="hidden sm:inline">Viveiros</span>
            </TabsTrigger>
            <TabsTrigger value="reforestation" className="flex items-center gap-2">
              <Trees className="h-4 w-4" />
              <span className="hidden sm:inline">Reflorest.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="licenses">
            <LicensesList
              onAddNew={() => setShowLicenseForm(true)}
              onView={handleViewLicense}
              onEdit={handleEditLicense}
            />
          </TabsContent>

          <TabsContent value="traceability">
            <TraceabilityDashboard />
          </TabsContent>

          <TabsContent value="infractions">
            <div className="card-elevated p-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Autos de Infracção</h3>
              <p className="mt-1 text-muted-foreground">Gestão de infracções e sanções florestais</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pendentes: {stats?.pendingInfractions || 0}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="complaints">
            <div className="card-elevated p-6 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Denúncias Comunitárias</h3>
              <p className="mt-1 text-muted-foreground">Canal de denúncias anónimas</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pendentes: {stats?.pendingComplaints || 0}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="nurseries">
            <div className="card-elevated p-6 text-center">
              <Sprout className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Viveiros Florestais</h3>
              <p className="mt-1 text-muted-foreground">Gestão de viveiros e stock de mudas</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Stock total: {stats?.totalNurseryStock.toLocaleString() || 0} mudas
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reforestation">
            <div className="card-elevated p-6 text-center">
              <Trees className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Programas de Reflorestamento</h3>
              <p className="mt-1 text-muted-foreground">Monitorização de programas de reflorestamento</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Área reflorestada: {stats?.totalReforestedArea.toLocaleString() || 0} ha
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* License Form Dialog */}
      <LicenseForm
        open={showLicenseForm}
        onClose={handleCloseLicenseForm}
        license={selectedLicense}
      />
    </MainLayout>
  );
}
