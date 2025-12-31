import { MainLayout } from '@/components/layout/MainLayout';
import { IncentivesAnalyticsDashboard } from '@/components/incentives-analytics/IncentivesAnalyticsDashboard';

export default function IncentivesAnalyticsPage() {
  return (
    <MainLayout 
      title="Gestão Inteligente de Incentivos"
      subtitle="Avaliação de impacto e orientação de decisões orçamentais"
    >
      <IncentivesAnalyticsDashboard />
    </MainLayout>
  );
}
