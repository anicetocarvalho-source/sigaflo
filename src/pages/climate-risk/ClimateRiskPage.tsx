import { MainLayout } from '@/components/layout/MainLayout';
import { ClimateRiskDashboard } from '@/components/climate-risk/ClimateRiskDashboard';

export default function ClimateRiskPage() {
  return (
    <MainLayout title="Gestão de Risco Climático e Seguro Agrícola">
      <ClimateRiskDashboard />
    </MainLayout>
  );
}
