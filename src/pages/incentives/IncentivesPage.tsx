import { MainLayout } from '@/components/layout/MainLayout';
import { IncentivesDashboard } from '@/components/incentives/IncentivesDashboard';

export default function IncentivesPage() {
  return (
    <MainLayout title="Gestão de Incentivos">
      <IncentivesDashboard />
    </MainLayout>
  );
}
