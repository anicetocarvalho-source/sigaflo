import { MainLayout } from '@/components/layout/MainLayout';
import { DataLabDashboard } from '@/components/data-lab/DataLabDashboard';

export default function DataLabPage() {
  return (
    <MainLayout 
      title="Laboratório Nacional de Dados Agro-Florestais"
      subtitle="Exploração avançada e controlada dos dados SIGAF para análise científica"
    >
      <DataLabDashboard />
    </MainLayout>
  );
}
