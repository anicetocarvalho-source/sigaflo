import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MemberSelector } from '@/components/farmers/MemberSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { useFarmer, useUpdateFarmer } from '@/hooks/useFarmers';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const AddMembersPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const { data: organization, isLoading } = useFarmer(id!);
  const updateFarmer = useUpdateFarmer();

  const handleSave = async () => {
    if (selectedMembers.length === 0) {
      toast.warning('Selecione pelo menos um agricultor para adicionar como membro');
      return;
    }

    try {
      // Update each selected farmer to link them to this organization
      await updateFarmer.mutateAsync({
        id: id!,
        memberIds: selectedMembers,
      });

      toast.success(`${selectedMembers.length} membro(s) adicionado(s) com sucesso!`);
      navigate(`/agricultores/${id}`);
    } catch (error) {
      toast.error('Erro ao adicionar membros');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="A carregar...">
        <Skeleton className="h-64 w-full" />
      </MainLayout>
    );
  }

  if (!organization) {
    return (
      <MainLayout title="Não encontrado">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Organização não encontrada</p>
          <Button variant="link" onClick={() => navigate('/agricultores')}>
            Voltar à lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  const organizationType = organization.farmer_type as 'cooperative' | 'field_school';
  const isFieldSchool = organizationType === 'field_school';
  
  const title = isFieldSchool 
    ? 'Adicionar Agricultores à Escola de Campo' 
    : 'Adicionar Membros à Cooperativa';
    
  const subtitle = isFieldSchool
    ? `Selecione pequenos agricultores (individuais ou familiares) para ${organization.name}`
    : `Selecione agricultores para ${organization.name}`;

  return (
    <MainLayout 
      title={title}
      subtitle={subtitle}
    >
      <div className="space-y-6">
        {/* Back button and info */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/agricultores/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Perfil
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={selectedMembers.length === 0 || updateFarmer.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateFarmer.isPending ? 'A guardar...' : `Adicionar ${selectedMembers.length} Membro(s)`}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {organization.name}
            </CardTitle>
            <CardDescription>
              {isFieldSchool ? (
                <>
                  <strong>Escola de Campo:</strong> Apenas agricultores individuais e familiares (pequenos agricultores) podem ser adicionados.
                </>
              ) : (
                <>
                  <strong>Cooperativa:</strong> Todos os tipos de agricultores registados podem ser adicionados como membros.
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Member Selector */}
        <MemberSelector
          organizationId={id}
          organizationType={organizationType}
          selectedMembers={selectedMembers}
          onMembersChange={setSelectedMembers}
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agricultores/${id}`)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={selectedMembers.length === 0 || updateFarmer.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateFarmer.isPending ? 'A guardar...' : `Adicionar ${selectedMembers.length} Membro(s)`}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddMembersPage;
