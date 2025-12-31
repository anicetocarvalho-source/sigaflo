import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TreesList } from './TreesList';
import { TreeForm } from './TreeForm';
import { LogsList } from './LogsList';
import { LogForm } from './LogForm';
import { TransportPermitsList } from './TransportPermitsList';
import { TransportPermitForm } from './TransportPermitForm';
import { TraceabilityMap } from './traceability/TraceabilityMap';
import { TraceabilityTimeline } from './traceability/TraceabilityTimeline';
import { TraceabilityAlerts } from './traceability/TraceabilityAlerts';
import { TraceabilityCharts } from './traceability/TraceabilityCharts';
import { QRScanner } from './traceability/QRScanner';
import { useForestTrees, useForestLogs, useTransportPermits, useForestLicenses, type ForestTree, type ForestLog, type ForestTransportPermit } from '@/hooks/useForestry';
import { TreePine, Logs, Truck, MapPin, ArrowRight, CheckCircle, QrCode, BarChart3, Clock, AlertTriangle, Filter, Calendar, Search } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { pt } from 'date-fns/locale';

export function TraceabilityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Forms state
  const [showTreeForm, setShowTreeForm] = useState(false);
  const [selectedTree, setSelectedTree] = useState<ForestTree | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ForestLog | null>(null);
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<ForestTransportPermit | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Filters state
  const [filterLicense, setFilterLicense] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: trees = [] } = useForestTrees(filterLicense === 'all' ? undefined : filterLicense);
  const { data: logs = [] } = useForestLogs(filterLicense === 'all' ? undefined : filterLicense);
  const { data: transports = [] } = useTransportPermits();
  const { data: licenses = [] } = useForestLicenses({ status: 'active' });

  // Get unique species
  const species = useMemo(() => {
    const speciesSet = new Set<string>();
    logs.forEach(log => speciesSet.add(log.species));
    trees.forEach(tree => speciesSet.add(tree.species));
    return Array.from(speciesSet).sort();
  }, [logs, trees]);

  // Apply filters
  const filteredData = useMemo(() => {
    const periodDays = filterPeriod === 'all' ? 0 : 
      filterPeriod === '7d' ? 7 : 
      filterPeriod === '30d' ? 30 : 
      filterPeriod === '90d' ? 90 : 0;
    
    const cutoffDate = periodDays > 0 ? subDays(new Date(), periodDays) : null;

    const filteredTrees = trees.filter(tree => {
      if (filterSpecies !== 'all' && tree.species !== filterSpecies) return false;
      if (cutoffDate && tree.created_at && !isAfter(new Date(tree.created_at), cutoffDate)) return false;
      if (searchTerm && !tree.tree_code.toLowerCase().includes(searchTerm.toLowerCase()) && !tree.species.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    const filteredLogs = logs.filter(log => {
      if (filterSpecies !== 'all' && log.species !== filterSpecies) return false;
      if (cutoffDate && log.created_at && !isAfter(new Date(log.created_at), cutoffDate)) return false;
      if (searchTerm && !log.log_code.toLowerCase().includes(searchTerm.toLowerCase()) && !log.species.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    const filteredTransports = transports.filter(transport => {
      if (cutoffDate && transport.created_at && !isAfter(new Date(transport.created_at), cutoffDate)) return false;
      if (searchTerm && !transport.permit_number.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    return { trees: filteredTrees, logs: filteredLogs, transports: filteredTransports };
  }, [trees, logs, transports, filterSpecies, filterPeriod, searchTerm]);

  // Stats
  const totalTrees = filteredData.trees.length;
  const treesLogged = filteredData.trees.filter(t => t.status === 'logged').length;
  const treesFelled = filteredData.trees.filter(t => t.status === 'felled').length;
  
  const totalLogs = filteredData.logs.length;
  const logsAtOrigin = filteredData.logs.filter(l => l.status === 'at_origin').length;
  const logsInTransit = filteredData.logs.filter(l => l.status === 'in_transport').length;
  const logsAtDestination = filteredData.logs.filter(l => l.status === 'at_destination').length;
  const totalVolume = filteredData.logs.reduce((sum, l) => sum + l.volume_m3, 0);

  const totalTransports = filteredData.transports.length;
  const activeTransports = filteredData.transports.filter(t => t.status === 'active' || t.status === 'in_transit').length;
  const completedTransports = filteredData.transports.filter(t => t.status === 'completed').length;

  const handleViewTree = (tree: ForestTree) => {
    setSelectedTree(tree);
    setShowTreeForm(true);
  };

  const handleViewLog = (log: ForestLog) => {
    setSelectedLog(log);
    setShowLogForm(true);
  };

  const handleViewTransport = (transport: ForestTransportPermit) => {
    setSelectedTransport(transport);
    setShowTransportForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Filtros Avançados</CardTitle>
            </div>
            <Button onClick={() => setShowQRScanner(true)} variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Verificar QR Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterLicense} onValueChange={setFilterLicense}>
              <SelectTrigger>
                <SelectValue placeholder="Licença" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Licenças</SelectItem>
                {licenses.map((license) => (
                  <SelectItem key={license.id} value={license.id}>
                    {license.license_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSpecies} onValueChange={setFilterSpecies}>
              <SelectTrigger>
                <SelectValue placeholder="Espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Espécies</SelectItem>
                {species.map((sp) => (
                  <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setFilterLicense('all');
                setFilterPeriod('all');
                setFilterSpecies('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="trees" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            <span className="hidden sm:inline">Árvores</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Logs className="h-4 w-4" />
            <span className="hidden sm:inline">Toras</span>
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Transporte</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Análise</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alerts */}
          <TraceabilityAlerts 
            trees={filteredData.trees} 
            logs={filteredData.logs} 
            transports={filteredData.transports} 
          />

          {/* Pipeline Visual */}
          <Card>
            <CardHeader>
              <CardTitle>Cadeia de Rastreabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {/* Step 1: Trees */}
                <div className="relative">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white mb-3">
                      <TreePine className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Árvores</h3>
                    <p className="text-2xl font-bold mt-1">{totalTrees}</p>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <p>{treesLogged} registadas</p>
                      <p>{treesFelled} abatidas</p>
                    </div>
                  </div>
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 text-muted-foreground/50" />
                </div>

                {/* Step 2: Logs */}
                <div className="relative">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white mb-3">
                      <Logs className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Toras</h3>
                    <p className="text-2xl font-bold mt-1">{totalLogs}</p>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <p>{logsAtOrigin} na origem</p>
                      <p>{totalVolume.toFixed(1)} m³ total</p>
                    </div>
                  </div>
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 text-muted-foreground/50" />
                </div>

                {/* Step 3: Transport */}
                <div className="relative">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white mb-3">
                      <Truck className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-blue-700 dark:text-blue-400">Transporte</h3>
                    <p className="text-2xl font-bold mt-1">{activeTransports}</p>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <p>{logsInTransit} toras em trânsito</p>
                      <p>{totalTransports} guias emitidas</p>
                    </div>
                  </div>
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 text-muted-foreground/50" />
                </div>

                {/* Step 4: Destination */}
                <div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white mb-3">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-purple-700 dark:text-purple-400">Destino</h3>
                    <p className="text-2xl font-bold mt-1">{logsAtDestination}</p>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <p>toras entregues</p>
                      <p>{completedTransports} viagens concluídas</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <TraceabilityMap 
            trees={filteredData.trees} 
            logs={filteredData.logs} 
            transports={filteredData.transports} 
          />

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimas Árvores Registadas</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredData.trees.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma árvore registada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredData.trees.slice(0, 5).map((tree) => (
                      <div 
                        key={tree.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleViewTree(tree)}
                      >
                        <div className="flex items-center gap-3">
                          <TreePine className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium">{tree.tree_code}</p>
                            <p className="text-xs text-muted-foreground">{tree.species}</p>
                          </div>
                        </div>
                        <span className="text-xs capitalize text-muted-foreground">{tree.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimas Guias Emitidas</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredData.transports.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma guia emitida
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredData.transports.slice(0, 5).map((transport) => (
                      <div 
                        key={transport.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleViewTransport(transport)}
                      >
                        <div className="flex items-center gap-3">
                          <Truck className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{transport.permit_number}</p>
                            <p className="text-xs text-muted-foreground">{transport.vehicle_plate}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {transport.total_volume_m3?.toFixed(1)} m³
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trees">
          <TreesList
            onAddNew={() => {
              setSelectedTree(null);
              setShowTreeForm(true);
            }}
            onView={handleViewTree}
            selectedLicenseId={filterLicense === 'all' ? undefined : filterLicense}
          />
        </TabsContent>

        <TabsContent value="logs">
          <LogsList
            onAddNew={() => {
              setSelectedLog(null);
              setShowLogForm(true);
            }}
            onView={handleViewLog}
            selectedLicenseId={filterLicense === 'all' ? undefined : filterLicense}
          />
        </TabsContent>

        <TabsContent value="transport">
          <TransportPermitsList
            onAddNew={() => {
              setSelectedTransport(null);
              setShowTransportForm(true);
            }}
            onView={handleViewTransport}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <TraceabilityCharts 
            trees={filteredData.trees} 
            logs={filteredData.logs} 
            transports={filteredData.transports} 
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TraceabilityTimeline 
            trees={filteredData.trees} 
            logs={filteredData.logs} 
            transports={filteredData.transports} 
          />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <TreeForm
        open={showTreeForm}
        onClose={() => {
          setShowTreeForm(false);
          setSelectedTree(null);
        }}
        tree={selectedTree}
      />

      <LogForm
        open={showLogForm}
        onClose={() => {
          setShowLogForm(false);
          setSelectedLog(null);
        }}
        log={selectedLog}
      />

      <TransportPermitForm
        open={showTransportForm}
        onClose={() => {
          setShowTransportForm(false);
          setSelectedTransport(null);
        }}
        permit={selectedTransport}
      />

      {/* QR Scanner */}
      <QRScanner
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
}
