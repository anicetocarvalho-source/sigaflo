import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerProfileComplete } from '@/components/farmers/FarmerProfileComplete';

const FarmerDetailPage = () => {
  return (
    <MainLayout title="Perfil do Agricultor" subtitle="Informações completas do produtor">
      <FarmerProfileComplete />
    </MainLayout>
  );
};

export default FarmerDetailPage;
