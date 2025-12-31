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
  Filter, 
  Store,
  ShoppingCart,
  Truck,
  Package,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Building2,
  FileText,
  Eye,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Warehouse
} from 'lucide-react';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Mock data for markets infrastructure
const mockMarkets = [
  {
    id: '1',
    name: 'Mercado Central de Luanda',
    type: 'wholesale',
    province: 'Luanda',
    municipality: 'Luanda',
    status: 'operational',
    condition: 'good',
    capacity: 5000,
    currentOccupancy: 4200,
    vendors: 850,
    dailyVisitors: 15000,
    products: ['Hortícolas', 'Frutas', 'Cereais', 'Carnes'],
    lastInspection: '2024-01-10',
    coordinates: { lat: -8.8383, lng: 13.2344 }
  },
  {
    id: '2',
    name: 'Mercado do Peixe - Benguela',
    type: 'fish_market',
    province: 'Benguela',
    municipality: 'Benguela',
    status: 'operational',
    condition: 'fair',
    capacity: 2000,
    currentOccupancy: 1800,
    vendors: 320,
    dailyVisitors: 5000,
    products: ['Peixe Fresco', 'Mariscos', 'Peixe Seco'],
    lastInspection: '2024-01-05',
    coordinates: { lat: -12.5763, lng: 13.4055 }
  },
  {
    id: '3',
    name: 'Feira Agrícola do Huambo',
    type: 'agricultural_fair',
    province: 'Huambo',
    municipality: 'Huambo',
    status: 'under_maintenance',
    condition: 'poor',
    capacity: 3000,
    currentOccupancy: 0,
    vendors: 0,
    dailyVisitors: 0,
    products: ['Cereais', 'Leguminosas', 'Tubérculos'],
    lastInspection: '2023-12-20',
    coordinates: { lat: -12.7761, lng: 15.7392 }
  },
  {
    id: '4',
    name: 'Centro de Distribuição - Cabinda',
    type: 'distribution_center',
    province: 'Cabinda',
    municipality: 'Cabinda',
    status: 'operational',
    condition: 'excellent',
    capacity: 8000,
    currentOccupancy: 6500,
    vendors: 45,
    dailyVisitors: 200,
    products: ['Produtos Importados', 'Cereais', 'Óleos'],
    lastInspection: '2024-01-12',
    coordinates: { lat: -5.5500, lng: 12.2000 }
  },
  {
    id: '5',
    name: 'Mercado Retalhista - Lubango',
    type: 'retail',
    province: 'Huíla',
    municipality: 'Lubango',
    status: 'operational',
    condition: 'good',
    capacity: 1500,
    currentOccupancy: 1350,
    vendors: 280,
    dailyVisitors: 8000,
    products: ['Hortícolas', 'Frutas', 'Produtos Lácteos'],
    lastInspection: '2024-01-08',
    coordinates: { lat: -14.9167, lng: 13.5000 }
  }
];

// Labels for market types
const marketTypeLabels: Record<string, string> = {
  wholesale: 'Grossista',
  retail: 'Retalhista',
  fish_market: 'Mercado de Peixe',
  agricultural_fair: 'Feira Agrícola',
  distribution_center: 'Centro de Distribuição',
  livestock_market: 'Mercado de Gado'
};

// Labels for status
const statusLabels: Record<string, string> = {
  operational: 'Operacional',
  under_maintenance: 'Em Manutenção',
  closed: 'Encerrado',
  under_construction: 'Em Construção'
};

// Labels for condition
const conditionLabels: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bom',
  fair: 'Razoável',
  poor: 'Precário'
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

// Chart data
const typeDistribution = [
  { name: 'Grossista', value: 25, color: '#3b82f6' },
  { name: 'Retalhista', value: 45, color: '#22c55e' },
  { name: 'Mercado de Peixe', value: 12, color: '#06b6d4' },
  { name: 'Feira Agrícola', value: 10, color: '#f59e0b' },
  { name: 'Centro de Distribuição', value: 8, color: '#8b5cf6' }
];

const provinceVisitors = [
  { province: 'Luanda', visitors: 150000, vendors: 8500 },
  { province: 'Benguela', visitors: 45000, vendors: 3200 },
  { province: 'Huambo', visitors: 38000, vendors: 2800 },
  { province: 'Huíla', visitors: 32000, vendors: 2100 },
  { province: 'Cabinda', visitors: 18000, vendors: 1200 }
];

export default function MarketsInfrastructurePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  const { provinces, municipalities, selectedProvinceId, setSelectedProvinceId } = useLocationCascade();

  // Filter markets
  const filteredMarkets = mockMarkets.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.province.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || market.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
    const matchesProvince = !selectedProvinceId || market.province === provinces.find(p => p.id === selectedProvinceId)?.name;
    return matchesSearch && matchesType && matchesStatus && matchesProvince;
  });

  // Calculate KPIs
  const totalMarkets = mockMarkets.length;
  const operationalMarkets = mockMarkets.filter(m => m.status === 'operational').length;
  const totalVendors = mockMarkets.reduce((sum, m) => sum + m.vendors, 0);
  const totalDailyVisitors = mockMarkets.reduce((sum, m) => sum + m.dailyVisitors, 0);
  const totalCapacity = mockMarkets.reduce((sum, m) => sum + m.capacity, 0);
  const totalOccupancy = mockMarkets.reduce((sum, m) => sum + m.currentOccupancy, 0);
  const occupancyRate = ((totalOccupancy / totalCapacity) * 100).toFixed(1);

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
                  <Input placeholder="Nome completo" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
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
                  <Select>
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
                  <Select>
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
                  <Input type="number" placeholder="Área total" />
                </div>
                <div className="space-y-2">
                  <Label>Nº de Bancas</Label>
                  <Input type="number" placeholder="Número de bancas" />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="under_maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="closed">Encerrado</SelectItem>
                      <SelectItem value="under_construction">Em Construção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condição</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Bom</SelectItem>
                      <SelectItem value="fair">Razoável</SelectItem>
                      <SelectItem value="poor">Precário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Produtos Comercializados</Label>
                  <Input placeholder="Ex: Hortícolas, Frutas, Cereais" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas adicionais sobre a infra-estrutura" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNewDialog(false)}>
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
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
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
                  <div className="text-2xl font-bold">{totalMarkets}</div>
                  <p className="text-xs text-muted-foreground">
                    {operationalMarkets} operacionais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendedores Registados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVendors.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{totalDailyVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Média estimada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{occupancyRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {totalOccupancy.toLocaleString()} / {totalCapacity.toLocaleString()} m²
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Tipos de mercados no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visitantes e Vendedores por Província</CardTitle>
                  <CardDescription>Comparativo das principais províncias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={provinceVisitors}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="province" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="visitors" name="Visitantes" fill="#3b82f6" />
                        <Bar yAxisId="right" dataKey="vendors" name="Vendedores" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Markets */}
            <Card>
              <CardHeader>
                <CardTitle>Mercados Recentes</CardTitle>
                <CardDescription>Últimas actualizações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMarkets.slice(0, 4).map(market => (
                    <div key={market.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTypeIcon(market.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{market.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {marketTypeLabels[market.type]} • {market.province}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(market.status)}
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Pesquisar mercados..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
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
                      <SelectItem value="all">Todos os Estados</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="under_maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="closed">Encerrado</SelectItem>
                      <SelectItem value="under_construction">Em Construção</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedProvinceId || 'all'} onValueChange={(v) => setSelectedProvinceId(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Província" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Províncias</SelectItem>
                      {provinces.map(province => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mercado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Vendedores</TableHead>
                      <TableHead>Ocupação</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMarkets.map(market => (
                      <TableRow key={market.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded">
                              {getTypeIcon(market.type)}
                            </div>
                            <div>
                              <p className="font-medium">{market.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {market.products.slice(0, 2).join(', ')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{marketTypeLabels[market.type]}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {market.province}, {market.municipality}
                          </div>
                        </TableCell>
                        <TableCell>{market.vendors.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(market.currentOccupancy / market.capacity) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {((market.currentOccupancy / market.capacity) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(market.status)}</TableCell>
                        <TableCell>{getConditionBadge(market.condition)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Mercados</CardTitle>
                <CardDescription>Visualização geográfica das infra-estruturas de mercados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Mapa Interactivo</p>
                    <p className="text-sm">Integração com Mapbox em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Ocupação</CardTitle>
                  <CardDescription>Taxa de ocupação por mercado</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Vendedores</CardTitle>
                  <CardDescription>Vendedores registados por mercado</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Manutenção</CardTitle>
                  <CardDescription>Estado de conservação das infra-estruturas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Visitantes</CardTitle>
                  <CardDescription>Fluxo de visitantes por mercado</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
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
