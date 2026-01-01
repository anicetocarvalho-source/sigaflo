import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerProfileComplete } from '@/components/farmers/FarmerProfileComplete';
import { useFarmer } from '@/hooks/useFarmers';

const getPageTitle = (farmerType: string | undefined) => {
  switch (farmerType) {
    case 'cooperative':
      return { title: 'Perfil da Cooperativa', subtitle: 'Informações completas da cooperativa agrícola' };
    case 'field_school':
      return { title: 'Perfil da Escola de Campo', subtitle: 'Informações completas da escola de campo' };
    case 'company':
      return { title: 'Perfil da Empresa', subtitle: 'Informações completas do grande produtor' };
    case 'family':
      return { title: 'Perfil do Agregado Familiar', subtitle: 'Informações completas da agricultura familiar' };
    default:
      return { title: 'Perfil do Agricultor', subtitle: 'Informações completas do produtor' };
  }
};

const FarmerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: farmer, isLoading } = useFarmer(id!);
  
  const { title, subtitle } = getPageTitle(farmer?.farmer_type);

  return (
    <MainLayout title={isLoading ? 'Carregando...' : title} subtitle={subtitle}>
      <FarmerProfileComplete />
    </MainLayout>
  );
};

export default FarmerDetailPage;
