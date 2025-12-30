import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductionDetail } from '@/components/production/ProductionDetail';
import { useProductionRecord } from '@/hooks/useProductionHistory';
import { Loader2 } from 'lucide-react';

const ProductionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading } = useProductionRecord(id || '');

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
    <MainLayout title="Detalhes da Produção" subtitle={`${record.crop_type} - ${record.season} ${record.year}`}>
      <ProductionDetail record={record} />
    </MainLayout>
  );
};

export default ProductionDetailPage;
