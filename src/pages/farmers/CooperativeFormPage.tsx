import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CooperativeForm } from '@/components/farmers/CooperativeForm';
import { useFarmer } from '@/hooks/useFarmers';
import { useCooperativeDetails, useSaveCooperative } from '@/hooks/useCooperative';

const CooperativeFormPage = ({ mode }: { mode: 'new' | 'edit' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';

  const { data: farmer } = useFarmer(isEdit ? (id || '') : '');
  const { data: details } = useCooperativeDetails(isEdit ? id : undefined);
  const save = useSaveCooperative();

  const handleSubmit = async (data: any) => {
    const farmerId = await save.mutateAsync({ id: isEdit ? id : undefined, ...data });
    navigate(`/agricultores/${farmerId}`);
  };

  return (
    <MainLayout
      title={isEdit ? 'Editar Cooperativa' : 'Nova Cooperativa'}
      subtitle={isEdit ? farmer?.name : 'Registar uma nova cooperativa agrícola'}
    >
      <CooperativeForm
        farmer={farmer}
        details={details}
        onSubmit={handleSubmit}
        isLoading={save.isPending}
      />
    </MainLayout>
  );
};

export default CooperativeFormPage;
