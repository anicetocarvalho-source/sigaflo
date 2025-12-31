import { MainLayout } from '@/components/layout/MainLayout';
import { CoffeeLotsDashboard } from '@/components/coffee/CoffeeLotsDashboard';

export default function CoffeeLotsPage() {
  return (
    <MainLayout title="Lotes de Café" subtitle="Gestão e rastreabilidade de lotes - Módulo INCA">
      <CoffeeLotsDashboard />
    </MainLayout>
  );
}
