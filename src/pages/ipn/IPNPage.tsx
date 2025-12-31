import { MainLayout } from '@/components/layout/MainLayout';
import { IPNDashboard } from '@/components/ipn/IPNDashboard';

export default function IPNPage() {
  return (
    <MainLayout 
      title="Identidade Produtiva"
      subtitle="Consolidação do histórico produtivo"
    >
      <IPNDashboard />
    </MainLayout>
  );
}
