import { MainLayout } from '@/components/layout/MainLayout';
import { CreditInsuranceDashboard } from '@/components/credit-insurance/CreditInsuranceDashboard';

export default function CreditInsurancePage() {
  return (
    <MainLayout 
      title="Preparação para Crédito e Seguro"
      subtitle="Perfis financeiros, simulações e dossiês para acesso a crédito bancário e seguro agrícola"
    >
      <CreditInsuranceDashboard />
    </MainLayout>
  );
}
