import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Building2,
  Plus,
  Search,
  Warehouse,
  Droplets,
  Factory,
  Truck,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Eye,
  Edit,
  Ruler,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { 
  useAgriculturalInfrastructure, 
  useAgriculturalInfrastructureStats,
  useCreateAgriculturalInfrastructure,
  AgriculturalInfrastructure 
} from '@/hooks/useInfrastructure';
import { toast } from 'sonner';

const infrastructureTypeLabels: Record<string, string> = {
  warehouse: 'Armazém',
  silo: 'Silo',
  irrigation: 'Irrigação',
  processing: 'Processamento',
  cold_storage: 'Frio',
  logistics: 'Logística',
};

const statusLabels: Record<string, string> = {
  operational: 'Operacional',
  maintenance: 'Manutenção',
  inactive: 'Inactivo',
  construction: 'Em Construção',
};

const conditionLabels: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bom',
  fair: 'Razoável',
  poor: 'Mau',
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'warehouse': return Warehouse;
    case 'silo': return Building2;
    case 'irrigation': return Droplets;
    case 'processing': return Factory;
    case 'cold_storage': return Warehouse;
    case 'logistics': return Truck;
    default: return Building2;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    case 'maintenance':
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><AlertTriangle className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    case 'inactive':
      return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    case 'construction':
      return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Building2 className="h-3 w-3 mr-1" />{statusLabels[status]}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getConditionBadge = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600">{conditionLabels[condition]}</Badge>;
    case 'good':
      return <Badge variant="outline" className="border-blue-500 text-blue-600">{conditionLabels[condition]}</Badge>;
    case 'fair':
      return <Badge variant="outline" className="border-amber-500 text-amber-600">{conditionLabels[condition]}</Badge>;
    case 'poor':
      return <Badge variant="outline" className="border-red-500 text-red-600">{conditionLabels[condition]}</Badge>;
    default:
      return <Badge variant="outline">{condition}</Badge>;
  }
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AgriculturalInfrastructurePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  const { 
    provinces, 
    municipalities, 
    selectedProvinceId, 
    handleProvinceChange, 
    handleMunicipalityChange,
    selectedMunicipalityId,
  } = useLocationCascade({});

  // Fetch real data
  const { data: infrastructure, isLoading, error } = useAgriculturalInfrastructure({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    province_id: selectedProvinceId || undefined,
  });
  
  const { data: stats } = useAgriculturalInfrastructureStats();
  const createInfrastructure = useCreateAgriculturalInfrastructure();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    infrastructure_type: 'warehouse' as const,
    capacity: '',
    capacity_unit: 'toneladas',
    built_year: '',
    manager_name: '',
    manager_contact: '',
    description: '',
  });

  const filteredInfrastructure = infrastructure?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provinces?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Chart data from stats
  const typeDistribution = stats ? Object.entries(stats.byType).map(([name, value], index) => ({
    name: infrastructureTypeLabels[name] || name,
    value,
    color: CHART_COLORS[index % CHART_COLORS.length],
  })) : [];

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    createInfrastructure.mutate({
      name: formData.name,
      infrastructure_type: formData.infrastructure_type,
      province_id: selectedProvinceId || undefined,
      municipality_id: selectedMunicipalityId || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      capacity_unit: formData.capacity_unit,
      built_year: formData.built_year ? parseInt(formData.built_year) : undefined,
      manager_name: formData.manager_name || undefined,
      manager_contact: formData.manager_contact || undefined,
      description: formData.description || undefined,
      status: 'operational',
    }, {
      onSuccess: () => {
        setShowNewDialog(false);
        setFormData({
          name: '',
          infrastructure_type: 'warehouse',
          capacity: '',
          capacity_unit: 'toneladas',
          built_year: '',
          manager_name: '',
          manager_contact: '',
          description: '',
        });
      },
    });
  };

  return (
    <MainLayout title="Infraestruturas Agropecuárias" subtitle="Gestão de armazéns, silos, sistemas de irrigação e centros de processamento">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Infraestrutura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registar Nova Infraestrutura</DialogTitle>
                <DialogDescription>
                  Adicione uma nova infraestrutura agropecuária ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input 
                      id="name" 
                      placeholder="Nome da infraestrutura"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={formData.infrastructure_type}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, infrastructure_type: val as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warehouse">Armazém</SelectItem>
                        <SelectItem value="silo">Silo</SelectItem>
                        <SelectItem value="irrigation">Sistema de Irrigação</SelectItem>
                        <SelectItem value="processing">Centro de Processamento</SelectItem>
                        <SelectItem value="cold_storage">Armazém Frigorífico</SelectItem>
                        <SelectItem value="logistics">Centro Logístico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Província</Label>
                    <Select onValueChange={handleProvinceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione a província" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="municipality">Município</Label>
                    <Select onValueChange={handleMunicipalityChange} disabled={!selectedProvinceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione o município" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      placeholder="0"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacityUnit">Unidade</Label>
                    <Select
                      value={formData.capacity_unit}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, capacity_unit: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toneladas">Toneladas</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="ton/dia">Ton/dia</SelectItem>
                        <SelectItem value="veículos">Veículos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="builtYear">Ano Construção</Label>
                    <Input 
                      id="builtYear" 
                      type="number" 
                      placeholder="2024"
                      value={formData.built_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, built_year: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Responsável</Label>
                    <Input 
                      id="manager" 
                      placeholder="Nome do responsável"
                      value={formData.manager_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contacto</Label>
                    <Input 
                      id="contact" 
                      placeholder="+244 9XX XXX XXX"
                      value={formData.manager_contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager_contact: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descrição da infraestrutura..." 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
                  <Button onClick={handleSubmit} disabled={createInfrastructure.isPending}>
                    {createInfrastructure.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Registar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Infraestruturas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">Registadas no sistema</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Operacionais</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.operational || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.total ? Math.round((stats.operational / stats.total) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCapacity?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Unidades de armazenamento</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ocupação</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalCapacity ? Math.round((stats.totalOccupancy / stats.totalCapacity) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Taxa de utilização</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Infraestruturas por categoria</CardDescription>
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
                  <CardDescription>Estado operacional das infraestruturas</CardDescription>
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
                      <SelectItem value="warehouse">Armazém</SelectItem>
                      <SelectItem value="silo">Silo</SelectItem>
                      <SelectItem value="irrigation">Irrigação</SelectItem>
                      <SelectItem value="processing">Processamento</SelectItem>
                      <SelectItem value="cold_storage">Frio</SelectItem>
                      <SelectItem value="logistics">Logística</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estados</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="construction">Em Construção</SelectItem>
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
                ) : filteredInfrastructure.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Capacidade</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Condição</TableHead>
                          <TableHead className="text-right">Acções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInfrastructure.map((item) => {
                          const TypeIcon = getTypeIcon(item.infrastructure_type);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <TypeIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    {item.manager_name && (
                                      <p className="text-xs text-muted-foreground">{item.manager_name}</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {infrastructureTypeLabels[item.infrastructure_type] || item.infrastructure_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                  {item.municipalities?.name && item.provinces?.name 
                                    ? `${item.municipalities.name}, ${item.provinces.name}`
                                    : item.provinces?.name || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.capacity ? `${item.capacity.toLocaleString()} ${item.capacity_unit || ''}` : '-'}
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell>{item.condition ? getConditionBadge(item.condition) : '-'}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma infraestrutura encontrada</p>
                    <Button className="mt-4" onClick={() => setShowNewDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Infraestrutura
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {filteredInfrastructure.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                A mostrar {filteredInfrastructure.length} infraestrutura(s)
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
                    <p>Mapa de infraestruturas</p>
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
