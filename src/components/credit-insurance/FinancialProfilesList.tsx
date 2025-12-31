import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  RefreshCw, 
  Search, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Calculator
} from 'lucide-react';
import { useFinancialProfiles, useCalculateFinancialProfile } from '@/hooks/useCreditInsurance';
import { useFarmers } from '@/hooks/useFarmers';
import { toast } from 'sonner';
import { FarmerFinancialProfileDetail } from './FarmerFinancialProfileDetail';

export function FinancialProfilesList() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  
  const { data: profiles, isLoading, refetch } = useFinancialProfiles({
    riskClassification: riskFilter !== 'all' ? riskFilter : undefined
  });
  
  const { data: farmers } = useFarmers();
  const calculateProfile = useCalculateFinancialProfile();

  const handleCalculateAll = async () => {
    if (!farmers || farmers.length === 0) {
      toast.error('Nenhum agricultor encontrado');
      return;
    }

    toast.info(`Calculando perfis para ${farmers.length} agricultores...`);
    
    let success = 0;
    for (const farmer of farmers.slice(0, 10)) { // Limit to 10 for demo
      try {
        await calculateProfile.mutateAsync(farmer.id);
        success++;
      } catch (e) {
        console.error(`Error calculating profile for ${farmer.id}:`, e);
      }
    }

    toast.success(`${success} perfis calculados com sucesso`);
    refetch();
  };

  const getRiskBadge = (classification: string) => {
    switch (classification) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Baixo</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Alto</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredProfiles = profiles?.filter(profile => {
    if (!search) return true;
    const farmerName = profile.farmer?.name?.toLowerCase() || '';
    return farmerName.includes(search.toLowerCase());
  });

  if (selectedFarmerId) {
    return (
      <FarmerFinancialProfileDetail 
        farmerId={selectedFarmerId} 
        onBack={() => setSelectedFarmerId(null)} 
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Perfis Financeiros Produtivos</CardTitle>
          <Button onClick={handleCalculateAll} disabled={calculateProfile.isPending}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Perfis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar agricultor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por risco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os riscos</SelectItem>
              <SelectItem value="low">Risco Baixo</SelectItem>
              <SelectItem value="medium">Risco Médio</SelectItem>
              <SelectItem value="high">Risco Alto</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agricultor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Anos Produção</TableHead>
                <TableHead>Score Crédito</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Elegível Crédito</TableHead>
                <TableHead>Elegível Seguro</TableHead>
                <TableHead>Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredProfiles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhum perfil encontrado. Clique em "Calcular Perfis" para gerar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profile.farmer?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.farmer?.registration_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {profile.farmer?.farmer_type === 'individual' ? 'Individual' : 
                         profile.farmer?.farmer_type === 'cooperative' ? 'Cooperativa' : 'Empresa'}
                      </Badge>
                    </TableCell>
                    <TableCell>{profile.production_years} anos</TableCell>
                    <TableCell>
                      <div className={`font-bold ${getScoreColor(profile.credit_score)}`}>
                        {profile.credit_score}/100
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(profile.risk_classification)}</TableCell>
                    <TableCell>
                      {profile.is_credit_eligible ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.is_insurance_eligible ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedFarmerId(profile.farmer_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
