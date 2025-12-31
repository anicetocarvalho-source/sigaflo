import { MainLayout } from '@/components/layout/MainLayout';
import { CoffeeSemaphoreDashboard } from '@/components/coffee/CoffeeSemaphoreDashboard';

export default function CoffeeSemaphorePage() {
  return (
    <MainLayout 
      title="Semaforização do Café" 
      subtitle="Sistema de classificação e controlo de qualidade para exportação - INCA"
    >
      <CoffeeSemaphoreDashboard />
    </MainLayout>
  );
}
