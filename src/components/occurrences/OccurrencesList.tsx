import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Users,
  Ruler,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useOccurrences, ClimateOccurrence } from '@/hooks/useOccurrences';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const occurrenceTypeLabels: Record<string, { label: string; icon: string }> = {
  drought: { label: 'Seca', icon: '☀️' },
  flood: { label: 'Inundação', icon: '🌊' },
  pest: { label: 'Praga', icon: '🦗' },
  disease: { label: 'Doença', icon: '🦠' },
  frost: { label: 'Geada', icon: '❄️' },
  hail: { label: 'Granizo', icon: '🌨️' },
  fire: { label: 'Incêndio', icon: '🔥' },
  other: { label: 'Outro', icon: '❓' },
};

const severityConfig: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline' }> = {
  critical: { label: 'Crítico', variant: 'destructive' },
  high: { label: 'Alto', variant: 'destructive' },
  medium: { label: 'Médio', variant: 'default' },
  low: { label: 'Baixo', variant: 'secondary' },
};

const statusConfig: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline' }> = {
  reported: { label: 'Reportada', variant: 'outline' },
  investigating: { label: 'Investigando', variant: 'secondary' },
  confirmed: { label: 'Confirmada', variant: 'default' },
  mitigating: { label: 'Mitigando', variant: 'default' },
  resolved: { label: 'Resolvida', variant: 'secondary' },
};

interface OccurrencesListProps {
  onSelectOccurrence?: (occurrence: ClimateOccurrence) => void;
}

export function OccurrencesList({ onSelectOccurrence }: OccurrencesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const { data: occurrences, isLoading } = useOccurrences();

  const filteredOccurrences = occurrences?.filter((occurrence) => {
    const matchesSearch = 
      occurrence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || occurrence.occurrence_type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || occurrence.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Ocorrências Registadas
        </CardTitle>
        <CardDescription>
          {filteredOccurrences?.length || 0} ocorrências encontradas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
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
              {Object.entries(occurrenceTypeLabels).map(([value, { label, icon }]) => (
                <SelectItem key={value} value={value}>
                  {icon} {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(severityConfig).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ocorrência</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccurrences?.map((occurrence) => (
                <TableRow key={occurrence.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {occurrenceTypeLabels[occurrence.occurrence_type]?.icon}
                      </span>
                      <div>
                        <p className="font-medium">{occurrence.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {occurrenceTypeLabels[occurrence.occurrence_type]?.label}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {occurrence.provinces?.name || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityConfig[occurrence.severity]?.variant}>
                      {severityConfig[occurrence.severity]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[occurrence.status]?.variant}>
                      {statusConfig[occurrence.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {occurrence.source === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                      {occurrence.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(occurrence.report_date), 'dd/MM/yyyy', { locale: pt })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectOccurrence?.(occurrence)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOccurrences?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma ocorrência encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats Row */}
        {occurrences && occurrences.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {occurrences.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0)} agricultores afetados
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              {occurrences.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0).toFixed(0)} ha afetados
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
