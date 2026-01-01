import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FarmerForm, type FarmerFormSubmitData } from '@/components/farmers/FarmerForm';
import { useCreateFarmer, useFarmer } from '@/hooks/useFarmers';

const FarmerNewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createFarmer = useCreateFarmer();

  // Get cooperative or field school ID from URL params
  const cooperativeId = searchParams.get('cooperative_id');
  const fieldSchoolId = searchParams.get('field_school_id');
  
  // Fetch parent organization details if linking to one
  const { data: parentOrg } = useFarmer(cooperativeId || fieldSchoolId || '');

  const handleSubmit = async (data: FarmerFormSubmitData) => {
    // Automatically set the parent organization if provided in URL
    const submitData = {
      ...data,
      parent_cooperative_id: cooperativeId || data.parent_cooperative_id,
      field_school_id: fieldSchoolId || data.field_school_id,
    };
    
    await createFarmer.mutateAsync(submitData);
    
    // Navigate back to the parent organization if we're adding a member
    if (cooperativeId || fieldSchoolId) {
      navigate(`/agricultores/${cooperativeId || fieldSchoolId}`);
    } else {
      navigate('/agricultores');
    }
  };

  // Determine page title based on context
  const getPageContext = () => {
    if (parentOrg) {
      return {
        title: `Novo Membro`,
        subtitle: `Adicionar agricultor à ${parentOrg.farmer_type === 'cooperative' ? 'cooperativa' : 'escola de campo'}: ${parentOrg.name}`
      };
    }
    return {
      title: 'Novo Registo',
      subtitle: 'Registar agricultor, cooperativa ou escola de campo'
    };
  };

  const { title, subtitle } = getPageContext();

  return (
    <MainLayout title={title} subtitle={subtitle}>
      <FarmerForm 
        onSubmit={handleSubmit} 
        isLoading={createFarmer.isPending}
        defaultCooperativeId={cooperativeId || undefined}
        defaultFieldSchoolId={fieldSchoolId || undefined}
      />
    </MainLayout>
  );
};

export default FarmerNewPage;
