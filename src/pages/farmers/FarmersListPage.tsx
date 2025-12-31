import { MainLayout } from '@/components/layout/MainLayout';
import { FarmersDashboard } from '@/components/farmers/FarmersDashboard';
import { FarmersListComplete } from '@/components/farmers/FarmersListComplete';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, List } from 'lucide-react';

const FarmersListPage = () => {
  return (
    <MainLayout title="Gestão de Agricultores" subtitle="Pequenos e grandes produtores, cooperativas e ECAs">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista de Agricultores
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <FarmersListComplete />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-6">
          <FarmersDashboard />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default FarmersListPage;
