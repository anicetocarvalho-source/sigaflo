import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FieldSchoolForm } from '@/components/farmers/FieldSchoolForm';
import { useFarmer } from '@/hooks/useFarmers';
import { useFieldSchoolDetails, useSaveFieldSchool } from '@/hooks/useFieldSchool';

const FieldSchoolFormPage = ({ mode }: { mode: 'new' | 'edit' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';

  const { data: farmer } = useFarmer(isEdit ? (id || '') : '');
  const { data: details } = useFieldSchoolDetails(isEdit ? id : undefined);
  const save = useSaveFieldSchool();

  const handleSubmit = async (data: any) => {
    const farmerId = await save.mutateAsync({ id: isEdit ? id : undefined, ...data });
    navigate(`/agricultores/${farmerId}`);
  };

  return (
    <MainLayout
      title={isEdit ? 'Editar Escola de Campo' : 'Nova Escola de Campo (ECA)'}
      subtitle={isEdit ? farmer?.name : 'Registar uma nova ECA'}
    >
      <FieldSchoolForm
        farmer={farmer}
        details={details}
        onSubmit={handleSubmit}
        isLoading={save.isPending}
      />
    </MainLayout>
  );
};

export default FieldSchoolFormPage;
