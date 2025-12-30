import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerForm } from '@/components/farmers/FarmerForm';
import { useFarmer, useUpdateFarmer } from '@/hooks/useFarmers';
import { Skeleton } from '@/components/ui/skeleton';

const FarmerEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: farmer, isLoading } = useFarmer(id!);
  const updateFarmer = useUpdateFarmer();

  const handleSubmit = async (data: any) => {
    await updateFarmer.mutateAsync({ id: id!, ...data });
    navigate(`/agricultores/${id}`);
  };

  if (isLoading) {
    return (
      <MainLayout title="Editar Registo" subtitle="A carregar...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Editar Registo" subtitle={farmer?.name || ''}>
      <FarmerForm 
        farmer={farmer} 
        onSubmit={handleSubmit} 
        isLoading={updateFarmer.isPending} 
      />
    </MainLayout>
  );
};

export default FarmerEditPage;
