import { MainLayout } from '@/components/layout/MainLayout';
import { TraceabilityDashboard } from '@/components/forestry/TraceabilityDashboard';

export default function ForestryTraceabilityPage() {
  return (
    <MainLayout
      title="Rastreabilidade Florestal"
      subtitle="Monitorização da cadeia de custódia da madeira"
    >
      <TraceabilityDashboard />
    </MainLayout>
  );
}
