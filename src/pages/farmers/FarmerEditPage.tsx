import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerForm } from '@/components/farmers/FarmerForm';
import { useFarmer, useUpdateFarmer } from '@/hooks/useFarmers';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/agricultores/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Registo</h1>
            <p className="text-muted-foreground">{farmer?.name}</p>
          </div>
        </div>

        <FarmerForm 
          farmer={farmer} 
          onSubmit={handleSubmit} 
          isLoading={updateFarmer.isPending} 
        />
      </div>
    </MainLayout>
  );
};

export default FarmerEditPage;
