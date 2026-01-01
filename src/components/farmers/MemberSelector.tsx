import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, UserPlus, UserMinus, X } from 'lucide-react';
import { useFarmers, type Farmer } from '@/hooks/useFarmers';

interface MemberSelectorProps {
  organizationId?: string;
  organizationType: 'cooperative' | 'field_school';
  selectedMembers: string[];
  onMembersChange: (memberIds: string[]) => void;
}

export const MemberSelector = ({
  organizationId,
  organizationType,
  selectedMembers,
  onMembersChange,
}: MemberSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailable, setShowAvailable] = useState(true);

  // Get all farmers
  const { data: allFarmers, isLoading } = useFarmers();

  // Filter based on organization type:
  // - Field schools: only individual and family farmers (small farmers)
  // - Cooperatives: all farmer types except cooperatives and field schools
  const eligibleFarmers = useMemo(() => {
    if (organizationType === 'field_school') {
      // Field schools only accept small farmers (individual and family)
      return allFarmers?.filter(f => 
        f.farmer_type === 'individual' || f.farmer_type === 'family'
      ) || [];
    } else {
      // Cooperatives accept all types except other cooperatives and field schools
      return allFarmers?.filter(f => 
        f.farmer_type !== 'cooperative' && f.farmer_type !== 'field_school'
      ) || [];
    }
  }, [allFarmers, organizationType]);

  // Current members (already linked to this organization)
  const currentMembers = useMemo(() => {
    if (!organizationId) return [];
    const field = organizationType === 'cooperative' ? 'parent_cooperative_id' : 'field_school_id';
    return eligibleFarmers.filter(f => f[field] === organizationId);
  }, [eligibleFarmers, organizationId, organizationType]);

  // Selected members from the form
  const selectedFarmers = useMemo(() => {
    return eligibleFarmers.filter(f => selectedMembers.includes(f.id));
  }, [eligibleFarmers, selectedMembers]);

  // Available farmers (not yet members of any organization of this type, or selected)
  const availableFarmers = useMemo(() => {
    const field = organizationType === 'cooperative' ? 'parent_cooperative_id' : 'field_school_id';
    return eligibleFarmers.filter(f => {
      // Already selected - show in selected list
      if (selectedMembers.includes(f.id)) return false;
      // Already member of another organization - don't show
      if (f[field] && f[field] !== organizationId) return false;
      // Already member of this organization - don't show in available
      if (f[field] === organizationId) return false;
      return true;
    });
  }, [eligibleFarmers, selectedMembers, organizationId, organizationType]);

  // Filter by search
  const filteredAvailable = useMemo(() => {
    if (!searchTerm) return availableFarmers;
    const term = searchTerm.toLowerCase();
    return availableFarmers.filter(f => 
      f.name.toLowerCase().includes(term) ||
      f.registration_number?.toLowerCase().includes(term) ||
      f.provinces?.name?.toLowerCase().includes(term)
    );
  }, [availableFarmers, searchTerm]);

  const toggleMember = (farmerId: string) => {
    if (selectedMembers.includes(farmerId)) {
      onMembersChange(selectedMembers.filter(id => id !== farmerId));
    } else {
      onMembersChange([...selectedMembers, farmerId]);
    }
  };

  const addAll = () => {
    const newIds = filteredAvailable.map(f => f.id);
    onMembersChange([...new Set([...selectedMembers, ...newIds])]);
  };

  const removeAll = () => {
    onMembersChange([]);
  };

  const FarmerTypeLabel = ({ type }: { type: string }) => {
    const labels: Record<string, string> = {
      individual: 'Individual',
      family: 'Familiar',
      company: 'Empresa',
    };
    return (
      <Badge variant="outline" className="text-xs">
        {labels[type] || type}
      </Badge>
    );
  };

  const FarmerRow = ({ farmer, isSelected }: { farmer: Farmer; isSelected: boolean }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary/10 border-primary' 
          : 'hover:bg-muted/50 border-border'
      }`}
      onClick={() => toggleMember(farmer.id)}
    >
      <Checkbox checked={isSelected} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{farmer.name}</span>
          <FarmerTypeLabel type={farmer.farmer_type} />
        </div>
        <div className="text-xs text-muted-foreground flex gap-2">
          {farmer.registration_number && <span>{farmer.registration_number}</span>}
          {farmer.provinces?.name && <span>• {farmer.provinces.name}</span>}
          {farmer.municipalities?.name && <span>• {farmer.municipalities.name}</span>}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          toggleMember(farmer.id);
        }}
      >
        {isSelected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      </Button>
    </div>
  );

  const organizationLabel = organizationType === 'cooperative' ? 'Cooperativa' : 'Escola de Campo';

  return (
    <div className="space-y-4">
      {/* Current Members (if editing existing organization) */}
      {currentMembers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros Actuais ({currentMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="flex flex-wrap gap-2">
                {currentMembers.map(member => (
                  <Badge key={member.id} variant="secondary" className="text-sm">
                    {member.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">
              Para alterar membros actuais, edite cada agricultor individualmente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Members */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Novos Membros a Vincular ({selectedMembers.length})
            </CardTitle>
            {selectedMembers.length > 0 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={removeAll}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedFarmers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum membro selecionado. Selecione agricultores da lista abaixo.
            </p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {selectedFarmers.map(farmer => (
                  <FarmerRow key={farmer.id} farmer={farmer} isSelected={true} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Available Farmers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agricultores Disponíveis ({filteredAvailable.length})
            </CardTitle>
            {filteredAvailable.length > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addAll}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Adicionar Todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, registo ou província..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              A carregar agricultores...
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm 
                ? 'Nenhum agricultor encontrado com esses critérios.' 
                : 'Não há agricultores disponíveis para vincular.'}
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredAvailable.slice(0, 50).map(farmer => (
                  <FarmerRow key={farmer.id} farmer={farmer} isSelected={false} />
                ))}
                {filteredAvailable.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Mostrando 50 de {filteredAvailable.length} resultados. Use a pesquisa para filtrar.
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
