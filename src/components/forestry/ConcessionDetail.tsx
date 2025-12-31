import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  FileCheck,
  TreePine,
  Logs,
  AlertTriangle,
  MapPin,
  Calendar,
  Truck,
  Download,
  QrCode,
  Loader2,
  Eye,
} from 'lucide-react';
import { 
  useForestLicense,
  useForestTrees,
  useForestLogs,
  useForestInfractions,
  type ForestTree,
  type ForestLog,
} from '@/hooks/useForestry';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  submitted: 'Submetido',
  under_review: 'Em Análise',
  approved: 'Aprovado',
  active: 'Activo',
  suspended: 'Suspenso',
  expired: 'Expirado',
  revoked: 'Revogado',
  rejected: 'Rejeitado',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const treeStatusLabels: Record<string, string> = {
  standing: 'Em pé',
  marked: 'Marcada',
  felled: 'Abatida',
  logged: 'Processada',
};

const logStatusLabels: Record<string, string> = {
  at_origin: 'Na origem',
  in_transport: 'Em trânsito',
  at_checkpoint: 'Em posto',
  at_destination: 'No destino',
  processed: 'Processada',
};

const infractionStatusLabels: Record<string, string> = {
  reported: 'Reportada',
  under_investigation: 'Em investigação',
  confirmed: 'Confirmada',
  contested: 'Contestada',
  closed: 'Encerrada',
  archived: 'Arquivada',
};

const infractionSeverityColors: Record<string, string> = {
  minor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  severe: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-200 text-red-900 dark:bg-red-800/50 dark:text-red-300',
};

export function ConcessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: license, isLoading: licenseLoading } = useForestLicense(id || '');
  const { data: trees = [], isLoading: treesLoading } = useForestTrees(id);
  const { data: logs = [], isLoading: logsLoading } = useForestLogs(id);
  const { data: allInfractions = [], isLoading: infractionsLoading } = useForestInfractions();

  // Filter infractions for this license
  const infractions = allInfractions.filter(inf => inf.related_license_id === id);

  if (licenseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FileCheck className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Licença não encontrada</h2>
        <Button variant="outline" onClick={() => navigate('/florestal')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  // Calculate stats
  const authorizedVolume = license.authorized_volume_m3 || 0;
  const harvestedVolume = license.harvested_volume_m3 || 0;
  const usedPercentage = authorizedVolume > 0 ? (harvestedVolume / authorizedVolume) * 100 : 0;
  const remainingVolume = authorizedVolume - harvestedVolume;
  
  const totalLogVolume = logs.reduce((sum, l) => sum + l.volume_m3, 0);
  const logsInTransit = logs.filter(l => l.status === 'in_transport').length;
  const logsAtDestination = logs.filter(l => l.status === 'at_destination' || l.status === 'processed').length;

  const openInfractions = infractions.filter(i => !['closed', 'archived'].includes(i.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/florestal')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{license.license_number}</h1>
              <Badge className={statusColors[license.status]} variant="secondary">
                {statusLabels[license.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {license.concession_area_name || 'Concessão Florestal'} • {license.provinces?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <TreePine className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Autorizado</p>
                <p className="text-2xl font-bold">{authorizedVolume.toLocaleString()} m³</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Utilizado</span>
                <span className="font-medium">{usedPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usedPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Restam {remainingVolume.toLocaleString()} m³
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Logs className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toras Registadas</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Volume total: {totalLogVolume.toFixed(2)} m³
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Trânsito</p>
                <p className="text-2xl font-bold">{logsInTransit}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Entregues: {logsAtDestination} toras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Infrações Abertas</p>
                <p className="text-2xl font-bold">{openInfractions.length}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Total registado: {infractions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Detalhes</span>
          </TabsTrigger>
          <TabsTrigger value="trees" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            <span className="hidden sm:inline">Árvores ({trees.length})</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Logs className="h-4 w-4" />
            <span className="hidden sm:inline">Toras ({logs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="infractions" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Infrações ({infractions.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações da Licença</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Operador</p>
                    <p className="font-medium">{license.forest_operators?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Licença</p>
                    <p className="font-medium capitalize">{license.license_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {license.issue_date ? format(new Date(license.issue_date), 'dd/MM/yyyy', { locale: pt }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Expiração</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {license.expiry_date ? format(new Date(license.expiry_date), 'dd/MM/yyyy', { locale: pt }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Área de Concessão</p>
                    <p className="font-medium">{license.concession_area_ha?.toLocaleString() || '-'} ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {license.provinces?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Espécies Autorizadas</CardTitle>
              </CardHeader>
              <CardContent>
                {license.authorized_species?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {license.authorized_species.map((species, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm py-1.5 px-3">
                        <TreePine className="mr-1.5 h-3.5 w-3.5" />
                        {species}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma espécie registada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trees Tab */}
        <TabsContent value="trees">
          <Card>
            <CardContent className="pt-6">
              {treesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : trees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TreePine className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Sem árvores registadas</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nenhuma árvore foi registada para esta concessão.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>DAP (cm)</TableHead>
                      <TableHead>Altura (m)</TableHead>
                      <TableHead>Volume (m³)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trees.map((tree) => (
                      <TableRow key={tree.id}>
                        <TableCell className="font-mono font-medium">{tree.tree_code}</TableCell>
                        <TableCell>{tree.species}</TableCell>
                        <TableCell>{tree.diameter_cm?.toFixed(1) || '-'}</TableCell>
                        <TableCell>{tree.height_m?.toFixed(1) || '-'}</TableCell>
                        <TableCell>{tree.estimated_volume_m3?.toFixed(2) || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {treeStatusLabels[tree.status] || tree.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-6">
              {logsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Logs className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Sem toras registadas</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nenhuma tora foi registada para esta concessão.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Árvore</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>Comprimento (m)</TableHead>
                      <TableHead>Volume (m³)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono font-medium">{log.log_code}</TableCell>
                        <TableCell className="font-mono text-sm">{log.forest_trees?.tree_code || '-'}</TableCell>
                        <TableCell>{log.forest_trees?.species || log.species}</TableCell>
                        <TableCell>{log.length_m?.toFixed(2) || '-'}</TableCell>
                        <TableCell>{log.volume_m3.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {logStatusLabels[log.status] || log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infractions Tab */}
        <TabsContent value="infractions">
          <Card>
            <CardContent className="pt-6">
              {infractionsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : infractions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Sem infrações registadas</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nenhuma infração foi registada para esta concessão.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Auto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Gravidade</TableHead>
                      <TableHead>Multa (AOA)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {infractions.map((infraction) => (
                      <TableRow key={infraction.id}>
                        <TableCell className="font-mono font-medium">{infraction.infraction_number}</TableCell>
                        <TableCell className="capitalize">{infraction.infraction_type.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          {format(new Date(infraction.occurrence_date), 'dd/MM/yyyy', { locale: pt })}
                        </TableCell>
                        <TableCell>
                          <Badge className={infractionSeverityColors[infraction.severity]} variant="secondary">
                            {infraction.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {infraction.fine_amount_aoa?.toLocaleString() || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {infractionStatusLabels[infraction.status] || infraction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
