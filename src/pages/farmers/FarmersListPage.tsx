import { MainLayout } from '@/components/layout/MainLayout';
import { FarmersList } from '@/components/farmers/FarmersList';
import { FarmersDashboard } from '@/components/farmers/FarmersDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, List } from 'lucide-react';

const FarmersListPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Agricultores</h1>
          <p className="text-muted-foreground">
            Pequenos e grandes produtores, cooperativas e escolas de campo
          </p>
        </div>

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
          <TabsContent value="dashboard">
            <FarmersDashboard />
          </TabsContent>
          <TabsContent value="list">
            <FarmersList />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FarmersListPage;
