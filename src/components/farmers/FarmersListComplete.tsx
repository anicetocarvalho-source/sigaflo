import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Edit,
  Search, 
  MapPin, 
  FileSpreadsheet,
  FileText,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Plus
} from 'lucide-react';
import { useFarmers, useProvinces, type Farmer, type FarmerType } from '@/hooks/useFarmers';
import { useFinancialProfiles, type FarmerFinancialProfile } from '@/hooks/useCreditInsurance';
import { FarmerTypeIcon, getFarmerTypeLabel, getFarmerTypeColor } from '@/components/farmers/FarmerTypeIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface EnhancedFarmer extends Farmer {
  financialProfile?: FarmerFinancialProfile;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-600 bg-green-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getScoreIcon = (score: number) => {
  if (score >= 70) return <TrendingUp className="h-3 w-3" />;
  if (score >= 40) return <Minus className="h-3 w-3" />;
  return <TrendingDown className="h-3 w-3" />;
};

const getStatusBadge = (isActive: boolean | null | undefined) => {
  if (isActive === true) {
    return <Badge variant="default" className="bg-green-600">Activo</Badge>;
  }
  return <Badge variant="secondary" className="bg-red-100 text-red-700">Suspenso</Badge>;
};

export const FarmersListComplete = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: provinces } = useProvinces();
  const { data: farmers, isLoading: farmersLoading } = useFarmers({
    province_id: provinceFilter === 'all' ? undefined : provinceFilter,
    type: typeFilter !== 'all' ? typeFilter as FarmerType : undefined,
    excludeTypes: ['cooperative', 'field_school'] as FarmerType[],
  });
  const { data: financialProfiles, isLoading: profilesLoading } = useFinancialProfiles();

  const isLoading = farmersLoading || profilesLoading;

  // Combine farmers with their financial profiles
  const enhancedFarmers = useMemo(() => {
    if (!farmers) return [];
    
    return farmers.map(farmer => ({
      ...farmer,
      financialProfile: financialProfiles?.find(p => p.farmer_id === farmer.id)
    })) as EnhancedFarmer[];
  }, [farmers, financialProfiles]);

  // Get unique crops from all farmers
  const uniqueCrops = useMemo(() => {
    const crops = new Set<string>();
    farmers?.forEach(farmer => {
      farmer.main_crops?.forEach(crop => crops.add(crop));
    });
    return Array.from(crops).sort();
  }, [farmers]);

  // Filter farmers
  const filteredFarmers = useMemo(() => {
    return enhancedFarmers.filter(farmer => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        farmer.name.toLowerCase().includes(searchLower) ||
        farmer.provinces?.name?.toLowerCase().includes(searchLower) ||
        farmer.municipalities?.name?.toLowerCase().includes(searchLower) ||
        farmer.communes?.name?.toLowerCase().includes(searchLower) ||
        farmer.main_crops?.some(crop => crop.toLowerCase().includes(searchLower));

      // Crop filter
      const matchesCrop = cropFilter === 'all' || farmer.main_crops?.includes(cropFilter);

      // Score filter
      const score = farmer.financialProfile?.credit_score || 0;
      let matchesScore = true;
      if (scoreFilter === 'high') matchesScore = score >= 70;
      else if (scoreFilter === 'medium') matchesScore = score >= 40 && score < 70;
      else if (scoreFilter === 'low') matchesScore = score < 40;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = farmer.is_active === true;
      else if (statusFilter === 'suspended') matchesStatus = farmer.is_active === false;

      return matchesSearch && matchesCrop && matchesScore && matchesStatus;
    });
  }, [enhancedFarmers, searchTerm, cropFilter, scoreFilter, statusFilter]);

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    const headers = ['Nome', 'Província', 'Município', 'Comuna', 'Cultura Principal', 'Área (ha)', 'Score Produtivo', 'Estado'];
    const rows = filteredFarmers.map(farmer => [
      farmer.name,
      farmer.provinces?.name || '-',
      farmer.municipalities?.name || '-',
      farmer.communes?.name || '-',
      farmer.main_crops?.[0] || '-',
      farmer.cultivated_area_ha?.toString() || '0',
      farmer.financialProfile?.credit_score?.toString() || '-',
      farmer.is_active ? 'Activo' : 'Suspenso'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agricultores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Ficheiro Excel exportado com sucesso');
  };

  // Export to PDF
  const handleExportPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Lista de Agricultores - SIGAF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a365d; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1a365d; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .date { color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Agricultores</h1>
            <span class="date">Data: ${new Date().toLocaleDateString('pt-AO')}</span>
          </div>
          <p>Total de registos: ${filteredFarmers.length}</p>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Localização</th>
                <th>Cultura Principal</th>
                <th>Área (ha)</th>
                <th>Score</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredFarmers.map(farmer => `
                <tr>
                  <td>${farmer.name}</td>
                  <td>${[farmer.provinces?.name, farmer.municipalities?.name, farmer.communes?.name].filter(Boolean).join(' / ')}</td>
                  <td>${farmer.main_crops?.[0] || '-'}</td>
                  <td>${farmer.cultivated_area_ha || 0}</td>
                  <td>${farmer.financialProfile?.credit_score || '-'}</td>
                  <td>${farmer.is_active ? 'Activo' : 'Suspenso'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('PDF gerado para impressão');
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{farmers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Agricultores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {enhancedFarmers.filter(f => (f.financialProfile?.credit_score || 0) >= 70).length}
                </p>
                <p className="text-sm text-muted-foreground">Score Alto (≥70)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Minus className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {enhancedFarmers.filter(f => {
                    const score = f.financialProfile?.credit_score || 0;
                    return score >= 40 && score < 70;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Score Médio (40-69)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {enhancedFarmers.filter(f => (f.financialProfile?.credit_score || 0) < 40).length}
                </p>
                <p className="text-sm text-muted-foreground">Score Baixo (&lt;40)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Pesquisa e Filtros
              </CardTitle>
              <CardDescription>
                Pesquise por nome, localização ou cultura. Use os filtros para refinar os resultados.
              </CardDescription>
            </div>
            <Link to="/agricultores/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Registo
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, localização, cultura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Province Filter */}
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Província" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Províncias</SelectItem>
                {provinces?.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="individual">Pequeno Agricultor</SelectItem>
                <SelectItem value="family">Agricultura Familiar</SelectItem>
                <SelectItem value="company">Empresa/Grande Produtor</SelectItem>
              </SelectContent>
            </Select>

            {/* Crop Filter */}
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cultura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Culturas</SelectItem>
                {uniqueCrops.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Score Filter */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Scores</SelectItem>
                <SelectItem value="high">Alto (≥70)</SelectItem>
                <SelectItem value="medium">Médio (40-69)</SelectItem>
                <SelectItem value="low">Baixo (&lt;40)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            {/* Export Buttons */}
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Agricultores ({filteredFarmers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Agricultor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Cultura Principal</TableHead>
                    <TableHead className="text-right">Área (ha)</TableHead>
                    <TableHead className="text-center">Score Produtivo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum agricultor encontrado com os filtros aplicados
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getFarmerTypeColor(farmer.farmer_type)} border-0 text-xs`}>
                              <FarmerTypeIcon type={farmer.farmer_type} className="h-3 w-3 mr-1" />
                              {getFarmerTypeLabel(farmer.farmer_type)}
                            </Badge>
                          </TableCell>
                    </TableRow>
                  ) : (
                    filteredFarmers.map((farmer) => {
                      const score = farmer.financialProfile?.credit_score;
                      return (
                        <TableRow key={farmer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{farmer.name}</p>
                              {farmer.registration_number && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {farmer.registration_number}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {farmer.provinces ? (
                              <div className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                                <div className="text-sm">
                                  <span className="font-medium">{farmer.provinces.name}</span>
                                  {farmer.municipalities && (
                                    <span className="text-muted-foreground"> / {farmer.municipalities.name}</span>
                                  )}
                                  {farmer.communes && (
                                    <span className="text-muted-foreground"> / {farmer.communes.name}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {farmer.main_crops && farmer.main_crops.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {farmer.main_crops[0]}
                                </Badge>
                                {farmer.main_crops.length > 1 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{farmer.main_crops.length - 1}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {farmer.cultivated_area_ha ? (
                              <span className="font-medium">{farmer.cultivated_area_ha.toFixed(1)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {score !== null && score !== undefined ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge className={`${getScoreColor(score)} flex items-center gap-1`}>
                                  {getScoreIcon(score)}
                                  {score}
                                </Badge>
                                <Progress value={score} className="h-1 w-16" />
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem perfil</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(farmer.is_active)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Link to={`/agricultores/${farmer.id}`}>
                                <Button variant="ghost" size="icon" title="Ver detalhes">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/agricultores/${farmer.id}/editar`}>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
