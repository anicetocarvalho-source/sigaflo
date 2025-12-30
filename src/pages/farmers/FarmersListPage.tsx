import { MainLayout } from '@/components/layout/MainLayout';
import { FarmersList } from '@/components/farmers/FarmersList';
import { FarmersDashboard } from '@/components/farmers/FarmersDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, List } from 'lucide-react';

const FarmersListPage = () => {
  return (
    <MainLayout title="Gestão de Agricultores" subtitle="Pequenos e grandes produtores, cooperativas e ECAs">
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <FarmersDashboard />
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <FarmersList />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default FarmersListPage;
