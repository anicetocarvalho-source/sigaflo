import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerForm, type FarmerFormSubmitData } from '@/components/farmers/FarmerForm';
import { useCreateFarmer } from '@/hooks/useFarmers';

const FarmerNewPage = () => {
  const navigate = useNavigate();
  const createFarmer = useCreateFarmer();

  const handleSubmit = async (data: FarmerFormSubmitData) => {
    await createFarmer.mutateAsync(data);
    navigate('/agricultores');
  };

  return (
    <MainLayout title="Novo Registo" subtitle="Registar agricultor, cooperativa ou escola de campo">
      <FarmerForm onSubmit={handleSubmit} isLoading={createFarmer.isPending} />
    </MainLayout>
  );
};

export default FarmerNewPage;
