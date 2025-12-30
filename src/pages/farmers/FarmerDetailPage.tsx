import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerDetail } from '@/components/farmers/FarmerDetail';

const FarmerDetailPage = () => {
  return (
    <MainLayout title="Detalhes do Registo" subtitle="Informações completas do agricultor">
      <FarmerDetail />
    </MainLayout>
  );
};

export default FarmerDetailPage;
