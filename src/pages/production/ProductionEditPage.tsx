import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductionForm } from '@/components/production/ProductionForm';
import { useProductionRecord, useUpdateProductionRecord } from '@/hooks/useProductionHistory';
import { Loader2 } from 'lucide-react';

const ProductionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading } = useProductionRecord(id || '');
  const { mutate: updateRecord, isPending } = useUpdateProductionRecord();

  const handleSubmit = (data: any) => {
    if (!id) return;
    updateRecord({ id, ...data }, {
      onSuccess: () => navigate(`/producao/${id}`),
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Carregando..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!record) {
    return (
      <MainLayout title="Registo não encontrado" subtitle="">
        <div className="text-center py-12 text-muted-foreground">
          O registo de produção solicitado não foi encontrado.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Editar Produção" subtitle={record.farmers?.name || ''}>
      <ProductionForm initialData={record} onSubmit={handleSubmit} onCancel={() => navigate(`/producao/${id}`)} isLoading={isPending} />
    </MainLayout>
  );
};

export default ProductionEditPage;
