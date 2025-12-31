import { MainLayout } from '@/components/layout/MainLayout';
import { ComplaintsDashboard } from '@/components/forestry/complaints/ComplaintsDashboard';

export default function ForestryComplaintsPage() {
  return (
    <MainLayout
      title="Denúncias Florestais"
      subtitle="Canal de denúncias de irregularidades florestais"
    >
      <ComplaintsDashboard />
    </MainLayout>
  );
}
