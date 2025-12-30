import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreesList } from './TreesList';
import { TreeForm } from './TreeForm';
import { LogsList } from './LogsList';
import { LogForm } from './LogForm';
import { TransportPermitsList } from './TransportPermitsList';
import { TransportPermitForm } from './TransportPermitForm';
import { useForestTrees, useForestLogs, useTransportPermits, type ForestTree, type ForestLog, type ForestTransportPermit } from '@/hooks/useForestry';
import { TreePine, Logs, Truck, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

export function TraceabilityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Forms state
  const [showTreeForm, setShowTreeForm] = useState(false);
  const [selectedTree, setSelectedTree] = useState<ForestTree | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ForestLog | null>(null);
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<ForestTransportPermit | null>(null);

  const { data: trees = [] } = useForestTrees();
  const { data: logs = [] } = useForestLogs();
  const { data: transports = [] } = useTransportPermits();

  // Stats
  const totalTrees = trees.length;
  const treesLogged = trees.filter(t => t.status === 'logged').length;
  const treesFelled = trees.filter(t => t.status === 'felled').length;
  
  const totalLogs = logs.length;
  const logsAtOrigin = logs.filter(l => l.status === 'at_origin').length;
  const logsInTransit = logs.filter(l => l.status === 'in_transport').length;
  const logsAtDestination = logs.filter(l => l.status === 'at_destination').length;
  const totalVolume = logs.reduce((sum, l) => sum + l.volume_m3, 0);

  const totalTransports = transports.length;
  const activeTransports = transports.filter(t => t.status === 'active' || t.status === 'in_transit').length;
  const completedTransports = transports.filter(t => t.status === 'completed').length;

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimas Árvores Registadas</CardTitle>
              </CardHeader>
              <CardContent>
                {trees.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma árvore registada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {trees.slice(0, 5).map((tree) => (
                      <div key={tree.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
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
                {transports.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma guia emitida
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transports.slice(0, 5).map((transport) => (
                      <div key={transport.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
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
          />
        </TabsContent>

        <TabsContent value="logs">
          <LogsList
            onAddNew={() => {
              setSelectedLog(null);
              setShowLogForm(true);
            }}
            onView={handleViewLog}
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
    </div>
  );
}
