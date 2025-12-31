import { MainLayout } from '@/components/layout/MainLayout';
import { ForestInventoryDashboard } from '@/components/forestry/ForestInventoryDashboard';

export default function ForestInventoryPage() {
  return (
    <MainLayout
      title="Inventário Florestal"
      subtitle="Gestão e monitorização das áreas florestais por concessão"
    >
      <ForestInventoryDashboard />
    </MainLayout>
  );
}
