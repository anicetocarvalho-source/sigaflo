import { MainLayout } from '@/components/layout/MainLayout';
import { ConcessionDetail } from '@/components/forestry/ConcessionDetail';

export default function ConcessionDetailPage() {
  return (
    <MainLayout
      title="Detalhe da Concessão"
      subtitle="Licenças, volumes autorizados, rastreio e infrações"
    >
      <ConcessionDetail />
    </MainLayout>
  );
}
