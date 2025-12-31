import { MainLayout } from '@/components/layout/MainLayout';
import { ProductionDashboard } from '@/components/production/ProductionDashboard';
import { ProductionList } from '@/components/production/ProductionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductionPage = () => {
  return (
    <MainLayout title="Histórico de Produção" subtitle="Registos de produção agrícola por campanha">
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
          <div className="flex justify-end mb-4">
            <Button asChild>
              <Link to="/producao/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registo
              </Link>
            </Button>
          </div>
          <ProductionDashboard />
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <ProductionList />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ProductionPage;
