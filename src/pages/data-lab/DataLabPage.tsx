import { MainLayout } from '@/components/layout/MainLayout';
import { DataLabDashboard } from '@/components/data-lab/DataLabDashboard';

export default function DataLabPage() {
  return (
    <MainLayout title="Laboratório de Dados">
      <DataLabDashboard />
    </MainLayout>
  );
}
