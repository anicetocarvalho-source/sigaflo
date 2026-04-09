import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, ClipboardList, BarChart3, Satellite } from 'lucide-react';
import { CentersList } from '@/components/mechanization/CentersList';
import { ServiceOrdersList } from '@/components/mechanization/ServiceOrdersList';
import { MechanizationCharts } from '@/components/mechanization/MechanizationCharts';
import { SatelliteValidation } from '@/components/mechanization/SatelliteValidation';

const MechanizationPage = () => {
  return (
    <MainLayout title="Mecanização Agrícola" subtitle="Gestão de centros de mecanização, ordens de serviço e validação por satélite">
      <Tabs defaultValue="dashboard">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Centros
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Ordens de Serviço
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            Validação Satélite
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <MechanizationCharts />
        </TabsContent>
        <TabsContent value="centers" className="mt-6">
          <CentersList />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <ServiceOrdersList />
        </TabsContent>
        <TabsContent value="validation" className="mt-6">
          <SatelliteValidation />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default MechanizationPage;
