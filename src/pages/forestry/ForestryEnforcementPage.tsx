import { MainLayout } from '@/components/layout/MainLayout';
import { EnforcementDashboard } from '@/components/forestry/enforcement/EnforcementDashboard';

export default function ForestryEnforcementPage() {
  return (
    <MainLayout
      title="Fiscalização Florestal"
      subtitle="Gestão de infrações, multas e apreensões"
    >
      <EnforcementDashboard />
    </MainLayout>
  );
}
