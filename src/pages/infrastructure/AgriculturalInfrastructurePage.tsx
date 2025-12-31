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
  Filter,
  Download,
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
  MoreHorizontal,
  Calendar,
  Ruler,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLocationCascade } from '@/hooks/useLocationCascade';

// Mock data for agricultural infrastructure
const mockInfrastructure = [
  {
    id: '1',
    name: 'Armazém Central de Luanda',
    type: 'warehouse',
    province: 'Luanda',
    municipality: 'Cacuaco',
    capacity: 5000,
    capacityUnit: 'toneladas',
    currentOccupancy: 3500,
    status: 'operational',
    condition: 'good',
    builtYear: 2018,
    lastInspection: '2024-10-15',
    coordinates: { lat: -8.8383, lng: 13.2344 },
    manager: 'João Silva',
    contact: '+244 923 456 789',
  },
  {
    id: '2',
    name: 'Silo de Malanje',
    type: 'silo',
    province: 'Malanje',
    municipality: 'Malanje',
    capacity: 2000,
    capacityUnit: 'toneladas',
    currentOccupancy: 1800,
    status: 'operational',
    condition: 'fair',
    builtYear: 2015,
    lastInspection: '2024-08-20',
    coordinates: { lat: -9.5402, lng: 16.3419 },
    manager: 'Maria Santos',
    contact: '+244 924 567 890',
  },
  {
    id: '3',
    name: 'Sistema de Irrigação do Cuanza Sul',
    type: 'irrigation',
    province: 'Cuanza Sul',
    municipality: 'Sumbe',
    capacity: 500,
    capacityUnit: 'hectares',
    currentOccupancy: 450,
    status: 'operational',
    condition: 'good',
    builtYear: 2020,
    lastInspection: '2024-11-01',
    coordinates: { lat: -11.2069, lng: 13.8439 },
    manager: 'Pedro Costa',
    contact: '+244 925 678 901',
  },
  {
    id: '4',
    name: 'Centro de Processamento Huambo',
    type: 'processing',
    province: 'Huambo',
    municipality: 'Huambo',
    capacity: 100,
    capacityUnit: 'ton/dia',
    currentOccupancy: 75,
    status: 'maintenance',
    condition: 'fair',
    builtYear: 2016,
    lastInspection: '2024-09-10',
    coordinates: { lat: -12.7761, lng: 15.7394 },
    manager: 'Ana Ferreira',
    contact: '+244 926 789 012',
  },
  {
    id: '5',
    name: 'Armazém Frigorífico Benguela',
    type: 'cold_storage',
    province: 'Benguela',
    municipality: 'Benguela',
    capacity: 800,
    capacityUnit: 'toneladas',
    currentOccupancy: 600,
    status: 'operational',
    condition: 'excellent',
    builtYear: 2022,
    lastInspection: '2024-10-25',
    coordinates: { lat: -12.5763, lng: 13.4055 },
    manager: 'Carlos Mendes',
    contact: '+244 927 890 123',
  },
  {
    id: '6',
    name: 'Centro Logístico Uíge',
    type: 'logistics',
    province: 'Uíge',
    municipality: 'Uíge',
    capacity: 50,
    capacityUnit: 'veículos',
    currentOccupancy: 35,
    status: 'operational',
    condition: 'good',
    builtYear: 2019,
    lastInspection: '2024-07-15',
    coordinates: { lat: -7.6088, lng: 15.0613 },
    manager: 'Rosa Neto',
    contact: '+244 928 901 234',
  },
];

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

// Chart data
const typeDistribution = [
  { name: 'Armazéns', value: 15, color: '#3b82f6' },
  { name: 'Silos', value: 8, color: '#10b981' },
  { name: 'Irrigação', value: 12, color: '#06b6d4' },
  { name: 'Processamento', value: 5, color: '#f59e0b' },
  { name: 'Frio', value: 4, color: '#8b5cf6' },
  { name: 'Logística', value: 6, color: '#ec4899' },
];

const provinceCapacity = [
  { province: 'Luanda', capacity: 12000, used: 9500 },
  { province: 'Huambo', capacity: 8000, used: 6200 },
  { province: 'Benguela', capacity: 6500, used: 5100 },
  { province: 'Malanje', capacity: 5000, used: 4200 },
  { province: 'Cuanza Sul', capacity: 4500, used: 3800 },
];

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
    handleMunicipalityChange 
  } = useLocationCascade({});

  const filteredInfrastructure = mockInfrastructure.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.province.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // KPIs
  const totalInfrastructure = mockInfrastructure.length;
  const operationalCount = mockInfrastructure.filter(i => i.status === 'operational').length;
  const totalCapacity = mockInfrastructure.reduce((sum, i) => i.type === 'warehouse' || i.type === 'silo' || i.type === 'cold_storage' ? sum + i.capacity : sum, 0);
  const avgOccupancy = Math.round(mockInfrastructure.reduce((sum, i) => sum + (i.currentOccupancy / i.capacity * 100), 0) / mockInfrastructure.length);

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
                    <Input id="name" placeholder="Nome da infraestrutura" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select>
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
                    <Input id="capacity" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacityUnit">Unidade</Label>
                    <Select>
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
                    <Input id="builtYear" type="number" placeholder="2024" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Responsável</Label>
                    <Input id="manager" placeholder="Nome do responsável" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contacto</Label>
                    <Input id="contact" placeholder="+244 9XX XXX XXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" placeholder="Descrição da infraestrutura..." rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
                  <Button onClick={() => setShowNewDialog(false)}>Registar</Button>
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
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
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
                  <div className="text-2xl font-bold">{totalInfrastructure}</div>
                  <p className="text-xs text-muted-foreground">Registadas no sistema</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Operacionais</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalCount}</div>
                  <p className="text-xs text-muted-foreground">{Math.round(operationalCount / totalInfrastructure * 100)}% do total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Toneladas de armazenamento</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ocupação Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgOccupancy}%</div>
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capacidade por Província</CardTitle>
                  <CardDescription>Capacidade total vs utilizada (toneladas)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={provinceCapacity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="province" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="capacity" name="Capacidade" fill="#3b82f6" />
                        <Bar dataKey="used" name="Utilizada" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Infrastructure */}
            <Card>
              <CardHeader>
                <CardTitle>Infraestruturas Recentes</CardTitle>
                <CardDescription>Últimas infraestruturas registadas ou actualizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInfrastructure.slice(0, 4).map((item) => {
                    const IconComponent = getTypeIcon(item.type);
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {item.province}, {item.municipality}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          {getConditionBadge(item.condition)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar infraestruturas..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
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
                      <SelectItem value="all">Todos os Estados</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="construction">Em Construção</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Ocupação</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInfrastructure.map((item) => {
                      const IconComponent = getTypeIcon(item.type);
                      const occupancyPct = Math.round(item.currentOccupancy / item.capacity * 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.manager}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{infrastructureTypeLabels[item.type]}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {item.province}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.capacity.toLocaleString()} {item.capacityUnit}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    occupancyPct > 90 ? 'bg-red-500' :
                                    occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${occupancyPct}%` }}
                                />
                              </div>
                              <span className="text-sm">{occupancyPct}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{getConditionBadge(item.condition)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Agendar Inspecção
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Infraestruturas</CardTitle>
                <CardDescription>Visualização geográfica de todas as infraestruturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Mapa interactivo será exibido aqui</p>
                    <p className="text-sm text-muted-foreground">Integração com Mapbox em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Capacidade</CardTitle>
                  <CardDescription>Análise da capacidade de armazenamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gere um relatório detalhado sobre a capacidade total de armazenamento, 
                    taxas de ocupação e projecções de necessidades futuras.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Manutenção</CardTitle>
                  <CardDescription>Estado e histórico de manutenções</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Relatório sobre o estado de conservação das infraestruturas, 
                    histórico de manutenções e necessidades identificadas.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório por Província</CardTitle>
                  <CardDescription>Distribuição geográfica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Análise da distribuição de infraestruturas por província, 
                    identificando gaps e oportunidades de investimento.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Inspecções</CardTitle>
                  <CardDescription>Calendário e resultados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Relatório sobre inspecções realizadas, resultados obtidos 
                    e calendário de próximas inspecções programadas.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
