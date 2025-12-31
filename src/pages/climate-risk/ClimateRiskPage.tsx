import { MainLayout } from '@/components/layout/MainLayout';
import { ClimateRiskDashboard } from '@/components/climate-risk/ClimateRiskDashboard';

export default function ClimateRiskPage() {
  return (
    <MainLayout 
      title="Gestão de Risco Climático"
      subtitle="Ocorrências, impactos e evidências para seguro agrícola"
    >
      <ClimateRiskDashboard />
    </MainLayout>
  );
}
