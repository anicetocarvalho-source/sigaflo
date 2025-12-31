import { MainLayout } from '@/components/layout/MainLayout';
import { CoffeeLotsTable } from '@/components/coffee/CoffeeLotsTable';

export default function CoffeeLotsPage() {
  return (
    <MainLayout title="Lotes de Café" subtitle="Gestão e rastreabilidade de lotes - Módulo INCA">
      <CoffeeLotsTable />
    </MainLayout>
  );
}
