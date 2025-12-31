import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICard } from '@/components/dashboard/KPICard';
import { OccurrenceForm } from '@/components/occurrences/OccurrenceForm';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin,
  Plus,
  Sun,
  Droplets,
  Bug,
  ThermometerSun,
  MessageSquare,
  Smartphone,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Eye,
} from 'lucide-react';
import { useOccurrences } from '@/hooks/useOccurrences';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const occurrenceTypes = {
  drought: { label: 'Seca', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  flood: { label: 'Inundação', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  pest: { label: 'Praga', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  disease: { label: 'Doença', icon: AlertTriangle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  frost: { label: 'Geada', icon: ThermometerSun, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  hail: { label: 'Granizo', icon: Droplets, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  fire: { label: 'Incêndio', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  other: { label: 'Outro', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

const sourceTypes = {
  sms: { label: 'SMS', icon: MessageSquare, color: 'text-green-600' },
  app: { label: 'Aplicação', icon: Smartphone, color: 'text-blue-600' },
  technician: { label: 'Técnico', icon: User, color: 'text-purple-600' },
  web: { label: 'Portal Web', icon: Smartphone, color: 'text-indigo-600' },
};

const statusTypes = {
  reported: { label: 'Reportada', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' },
  investigating: { label: 'Em Investigação', icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed: { label: 'Confirmada', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  mitigating: { label: 'Em Mitigação', icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50' },
  resolved: { label: 'Resolvida', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  closed: { label: 'Encerrada', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function ClimateOccurrencesPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: occurrences, isLoading } = useOccurrences();

  const filteredOccurrences = occurrences?.filter((occurrence) => {
    const matchesSearch = 
      occurrence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || occurrence.occurrence_type === typeFilter;
    const matchesSource = sourceFilter === 'all' || occurrence.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || occurrence.status === statusFilter;
    return matchesSearch && matchesType && matchesSource && matchesStatus;
  }) || [];

  // Statistics
  const droughtCount = occurrences?.filter(o => o.occurrence_type === 'drought').length || 0;
  const floodCount = occurrences?.filter(o => o.occurrence_type === 'flood').length || 0;
  const pestCount = occurrences?.filter(o => o.occurrence_type === 'pest').length || 0;
  const pendingCount = occurrences?.filter(o => ['reported', 'investigating', 'confirmed'].includes(o.status)).length || 0;

  return (
    <MainLayout 
      title="Ocorrências Agro-Climáticas" 
      subtitle="Monitorização de eventos climáticos e fitossanitários"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Secas"
            value={droughtCount.toString()}
            subtitle="Ocorrências activas"
            icon={<Sun className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            title="Inundações"
            value={floodCount.toString()}
            subtitle="Ocorrências activas"
            icon={<Droplets className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Pragas"
            value={pestCount.toString()}
            subtitle="Ocorrências activas"
            icon={<Bug className="h-5 w-5" />}
            variant="accent"
          />
          <KPICard
            title="Pendentes"
            value={pendingCount.toString()}
            subtitle="Aguardando resposta"
            icon={<AlertCircle className="h-5 w-5" />}
            variant="warning"
          />
        </section>

        {/* Actions & Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Lista de Ocorrências
              </CardTitle>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Ocorrência
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar ocorrências..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="drought">Seca</SelectItem>
                  <SelectItem value="flood">Inundação</SelectItem>
                  <SelectItem value="pest">Praga</SelectItem>
                  <SelectItem value="disease">Doença</SelectItem>
                  <SelectItem value="frost">Geada</SelectItem>
                  <SelectItem value="fire">Incêndio</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="app">Aplicação</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                  <SelectItem value="web">Portal Web</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="reported">Reportada</SelectItem>
                  <SelectItem value="investigating">Em Investigação</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="mitigating">Em Mitigação</SelectItem>
                  <SelectItem value="resolved">Resolvida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Estado de Resposta</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOccurrences.map((occurrence) => {
                      const typeConfig = occurrenceTypes[occurrence.occurrence_type as keyof typeof occurrenceTypes] || occurrenceTypes.other;
                      const sourceConfig = sourceTypes[occurrence.source as keyof typeof sourceTypes] || sourceTypes.app;
                      const statusConfig = statusTypes[occurrence.status as keyof typeof statusTypes] || statusTypes.reported;
                      const TypeIcon = typeConfig.icon;
                      const SourceIcon = sourceConfig.icon;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow key={occurrence.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${typeConfig.bg} w-fit`}>
                              <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                              <span className={`text-sm font-medium ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{occurrence.title}</p>
                              {occurrence.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                  {occurrence.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {occurrence.provinces?.name || 'N/A'}
                                {occurrence.municipalities?.name && (
                                  <span className="text-muted-foreground">
                                    , {occurrence.municipalities.name}
                                  </span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <SourceIcon className={`h-4 w-4 ${sourceConfig.color}`} />
                              <span className="text-sm">{sourceConfig.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig.bg} ${statusConfig.color} border-0`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(occurrence.report_date), 'dd/MM/yyyy', { locale: pt })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredOccurrences.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          Nenhuma ocorrência encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary */}
            {filteredOccurrences.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <span>{filteredOccurrences.length} ocorrências encontradas</span>
                <div className="flex gap-4">
                  <span>
                    {occurrences?.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0) || 0} agricultores afetados
                  </span>
                  <span>
                    {(occurrences?.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0) || 0).toFixed(0)} ha afetados
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <OccurrenceForm open={showForm} onOpenChange={setShowForm} />
      </div>
    </MainLayout>
  );
}
