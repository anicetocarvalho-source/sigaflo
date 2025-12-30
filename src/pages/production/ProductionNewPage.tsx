import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductionForm } from '@/components/production/ProductionForm';
import { useCreateProductionRecord } from '@/hooks/useProductionHistory';

const ProductionNewPage = () => {
  const navigate = useNavigate();
  const { mutate: createRecord, isPending } = useCreateProductionRecord();

  const handleSubmit = (data: any) => {
    createRecord(data, {
      onSuccess: () => navigate('/producao'),
    });
  };

  return (
    <MainLayout title="Novo Registo de Produção" subtitle="Adicionar novo registo de produção agrícola">
      <ProductionForm onSubmit={handleSubmit} onCancel={() => navigate('/producao')} isLoading={isPending} />
    </MainLayout>
  );
};

export default ProductionNewPage;
