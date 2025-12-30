import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerForm } from '@/components/farmers/FarmerForm';
import { useCreateFarmer } from '@/hooks/useFarmers';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FarmerNewPage = () => {
  const navigate = useNavigate();
  const createFarmer = useCreateFarmer();

  const handleSubmit = async (data: any) => {
    await createFarmer.mutateAsync(data);
    navigate('/agricultores');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/agricultores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Novo Registo</h1>
            <p className="text-muted-foreground">
              Registar agricultor, cooperativa ou escola de campo
            </p>
          </div>
        </div>

        <FarmerForm onSubmit={handleSubmit} isLoading={createFarmer.isPending} />
      </div>
    </MainLayout>
  );
};

export default FarmerNewPage;
