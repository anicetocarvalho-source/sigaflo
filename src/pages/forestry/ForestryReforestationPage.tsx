import { MainLayout } from '@/components/layout/MainLayout';
import { ReforestationDashboard } from '@/components/forestry/reforestation/ReforestationDashboard';

export default function ForestryReforestationPage() {
  return (
    <MainLayout
      title="Programas de Reflorestamento"
      subtitle="Gestão de projectos de reflorestamento e viveiros florestais"
    >
      <ReforestationDashboard />
    </MainLayout>
  );
}
