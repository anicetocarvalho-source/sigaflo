import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Store,
  ShoppingCart,
  Truck,
  Package,
  MapPin,
  Users,
  TrendingUp,
  Building2,
  FileText,
  Eye,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Warehouse,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  useMarketInfrastructure, 
  useMarketInfrastructureStats,
  useCreateMarketInfrastructure,
  useDeleteMarketInfrastructure,
  MarketInfrastructure 
} from '@/hooks/useInfrastructure';
import { toast } from 'sonner';

// Labels for market types
const marketTypeLabels: Record<string, string> = {
  wholesale: 'Grossista',
  retail: 'Retalhista',
  fish_market: 'Mercado de Peixe',
  agricultural_fair: 'Feira Agrícola',
  distribution_center: 'Centro de Distribuição',
  livestock_market: 'Mercado de Gado',
};

// Labels for status
const statusLabels: Record<string, string> = {
  operational: 'Operacional',
  under_maintenance: 'Em Manutenção',
  closed: 'Encerrado',
  under_construction: 'Em Construção',
};

// Labels for condition
const conditionLabels: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bom',
  fair: 'Razoável',
  poor: 'Precário',
};

// Get icon based on market type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'wholesale':
      return <Warehouse className="h-5 w-5" />;
    case 'retail':
      return <Store className="h-5 w-5" />;
    case 'fish_market':
      return <ShoppingCart className="h-5 w-5" />;
    case 'agricultural_fair':
      return <Package className="h-5 w-5" />;
    case 'distribution_center':
      return <Truck className="h-5 w-5" />;
    case 'livestock_market':
      return <Building2 className="h-5 w-5" />;
    default:
      return <Store className="h-5 w-5" />;
  }
};

// Get badge based on status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    case 'under_maintenance':
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"><Clock className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    case 'closed':
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20"><XCircle className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    case 'under_construction':
      return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"><Building2 className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Get badge based on condition
const getConditionBadge = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return <Badge variant="outline" className="border-green-500 text-green-600">{conditionLabels[condition]}</Badge>;
    case 'good':
      return <Badge variant="outline" className="border-blue-500 text-blue-600">{conditionLabels[condition]}</Badge>;
    case 'fair':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">{conditionLabels[condition]}</Badge>;
    case 'poor':
      return <Badge variant="outline" className="border-red-500 text-red-600">{conditionLabels[condition]}</Badge>;
    default:
      return <Badge variant="outline">{condition}</Badge>;
  }
};

const CHART_COLORS = ['#3b82f6', '#22c55e', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function MarketsInfrastructurePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  const { 
    provinces, 
    municipalities, 
    selectedProvinceId, 
    setSelectedProvinceId,
    selectedMunicipalityId,
    handleMunicipalityChange,
  } = useLocationCascade();

  // Fetch real data
  const { data: markets, isLoading, error } = useMarketInfrastructure({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    province_id: selectedProvinceId || undefined,
  });

  const { data: stats } = useMarketInfrastructureStats();
  const createMarket = useCreateMarketInfrastructure();
  const deleteMarket = useDeleteMarketInfrastructure();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    market_type: 'retail' as const,
    capacity_sqm: '',
    stalls_count: '',
    description: '',
  });

  // Filter markets
  const filteredMarkets = markets?.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.provinces?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Chart data from stats
  const typeDistribution = stats ? Object.entries(stats.byType).map(([name, value], index) => ({
    name: marketTypeLabels[name] || name,
    value,
    color: CHART_COLORS[index % CHART_COLORS.length],
  })) : [];

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    createMarket.mutate({
      name: formData.name,
      market_type: formData.market_type,
      province_id: selectedProvinceId || undefined,
      municipality_id: selectedMunicipalityId || undefined,
      capacity_sqm: formData.capacity_sqm ? parseInt(formData.capacity_sqm) : undefined,
      stalls_count: formData.stalls_count ? parseInt(formData.stalls_count) : undefined,
      description: formData.description || undefined,
      status: 'operational',
    }, {
      onSuccess: () => {
        setShowNewDialog(false);
        setFormData({
          name: '',
          market_type: 'retail',
          capacity_sqm: '',
          stalls_count: '',
          description: '',
        });
      },
    });
  };

  return (
    <MainLayout title="Infra-estruturas de Mercados" subtitle="Gestão de mercados e centros de comercialização">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Mercado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registar Novo Mercado</DialogTitle>
                <DialogDescription>
                  Adicione uma nova infra-estrutura de mercado ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Mercado</Label>
                  <Input 
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.market_type}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, market_type: val as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Grossista</SelectItem>
                      <SelectItem value="retail">Retalhista</SelectItem>
                      <SelectItem value="fish_market">Mercado de Peixe</SelectItem>
                      <SelectItem value="agricultural_fair">Feira Agrícola</SelectItem>
                      <SelectItem value="distribution_center">Centro de Distribuição</SelectItem>
                      <SelectItem value="livestock_market">Mercado de Gado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Província</Label>
                  <Select onValueChange={setSelectedProvinceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a província" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(province => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Município</Label>
                  <Select onValueChange={handleMunicipalityChange} disabled={!selectedProvinceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione o município" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map(municipality => (
                        <SelectItem key={municipality.id} value={municipality.id}>
                          {municipality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capacidade (m²)</Label>
                  <Input 
                    type="number" 
                    placeholder="Área total"
                    value={formData.capacity_sqm}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity_sqm: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nº de Bancas</Label>
                  <Input 
                    type="number" 
                    placeholder="Número de bancas"
                    value={formData.stalls_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, stalls_count: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Textarea 
                    placeholder="Notas adicionais sobre a infra-estrutura"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={createMarket.isPending}>
                  {createMarket.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Registar Mercado
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="list">
              <Store className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-2" />
              Mapa
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Mercados</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.operational || 0} operacionais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendedores Registados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalVendors?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Em todos os mercados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Diários</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalVisitors?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Média estimada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa Operacional</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total ? Math.round((stats.operational / stats.total) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mercados activos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Mercados por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {typeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {typeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Sem dados disponíveis
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Por Estado</CardTitle>
                  <CardDescription>Estado operacional dos mercados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {stats?.byStatus && Object.keys(stats.byStatus).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(stats.byStatus).map(([name, value]) => ({
                          name: statusLabels[name] || name,
                          value,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Sem dados disponíveis
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar por nome ou localização..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="wholesale">Grossista</SelectItem>
                      <SelectItem value="retail">Retalhista</SelectItem>
                      <SelectItem value="fish_market">Mercado de Peixe</SelectItem>
                      <SelectItem value="agricultural_fair">Feira Agrícola</SelectItem>
                      <SelectItem value="distribution_center">Centro de Distribuição</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estados</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="under_maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="closed">Encerrado</SelectItem>
                      <SelectItem value="under_construction">Em Construção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-destructive">
                    Erro ao carregar dados
                  </div>
                ) : filteredMarkets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Bancas</TableHead>
                          <TableHead>Vendedores</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Condição</TableHead>
                          <TableHead className="text-right">Acções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMarkets.map((market) => (
                          <TableRow key={market.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  {getTypeIcon(market.market_type)}
                                </div>
                                <div>
                                  <p className="font-medium">{market.name}</p>
                                  {market.manager_name && (
                                    <p className="text-xs text-muted-foreground">{market.manager_name}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {marketTypeLabels[market.market_type] || market.market_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                {market.municipalities?.name && market.provinces?.name 
                                  ? `${market.municipalities.name}, ${market.provinces.name}`
                                  : market.provinces?.name || '-'}
                              </div>
                            </TableCell>
                            <TableCell>{market.stalls_count?.toLocaleString() || '-'}</TableCell>
                            <TableCell>{market.vendors_count?.toLocaleString() || '-'}</TableCell>
                            <TableCell>{getStatusBadge(market.status)}</TableCell>
                            <TableCell>{market.condition ? getConditionBadge(market.condition) : '-'}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Eliminar mercado?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acção é irreversível. "{market.name}" será permanentemente eliminado.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMarket.mutate(market.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum mercado encontrado</p>
                    <Button className="mt-4" onClick={() => setShowNewDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Mercado
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {filteredMarkets.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                A mostrar {filteredMarkets.length} mercado(s)
              </p>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Mapa de mercados</p>
                    <p className="text-sm">Integração com Mapbox pendente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
