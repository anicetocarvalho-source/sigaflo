import { MainLayout } from '@/components/layout/MainLayout';
import { ClimateRiskAnalyticsDashboard } from '@/components/climate-risk-analytics/ClimateRiskAnalyticsDashboard';

export default function ClimateRiskAnalyticsPage() {
  return (
    <MainLayout 
      title="Risco Climático e Seguro Agrícola"
      subtitle="Antecipação de riscos e suporte a decisões de mitigação e compensação"
    >
      <ClimateRiskAnalyticsDashboard />
    </MainLayout>
  );
}
