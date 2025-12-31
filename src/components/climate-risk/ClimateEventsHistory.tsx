import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useClimateEvents } from '@/hooks/useClimateRisk';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Search, Filter, MapPin, Calendar, AlertTriangle } from 'lucide-react';

export function ClimateEventsHistory() {
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data } = await supabase.from('provinces').select('id, name').order('name');
      return data || [];
    },
  });

  const { data: events, isLoading } = useClimateEvents({
    provinceId: provinceFilter !== 'all' ? provinceFilter : undefined,
    severity: severityFilter !== 'all' ? severityFilter : undefined,
    eventType: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const filteredEvents = events?.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.province_name.toLowerCase().includes(search.toLowerCase())
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critico': return <Badge variant="destructive">Crítico</Badge>;
      case 'alto': return <Badge className="bg-orange-500">Alto</Badge>;
      case 'medio': return <Badge className="bg-yellow-500 text-yellow-950">Médio</Badge>;
      default: return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      seca: 'Seca',
      inundacao: 'Inundação',
      pragas: 'Pragas',
      tempestade: 'Tempestade',
      geada: 'Geada',
      granizo: 'Granizo',
      vendaval: 'Vendaval',
    };
    return types[type] || type;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Eventos Climáticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Província" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Províncias</SelectItem>
              {provinces?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="baixo">Baixa</SelectItem>
              <SelectItem value="medio">Média</SelectItem>
              <SelectItem value="alto">Alta</SelectItem>
              <SelectItem value="critico">Crítica</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="seca">Seca</SelectItem>
              <SelectItem value="inundacao">Inundação</SelectItem>
              <SelectItem value="pragas">Pragas</SelectItem>
              <SelectItem value="tempestade">Tempestade</SelectItem>
              <SelectItem value="geada">Geada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead className="text-right">Área Afectada</TableHead>
                <TableHead className="text-right">Agricultores</TableHead>
                <TableHead className="text-right">Perda Estimada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Carregando eventos...
                  </TableCell>
                </TableRow>
              ) : filteredEvents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum evento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(event.report_date), 'dd/MM/yyyy', { locale: pt })}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {event.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEventTypeLabel(event.occurrence_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{event.province_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                    <TableCell className="text-right">
                      {event.affected_area_ha?.toLocaleString() || 'N/A'} ha
                    </TableCell>
                    <TableCell className="text-right">
                      {event.affected_farmers_count?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(event.estimated_loss_aoa)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        {filteredEvents && filteredEvents.length > 0 && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredEvents.length}</p>
              <p className="text-sm text-muted-foreground">Total Eventos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {filteredEvents.reduce((sum, e) => sum + (e.affected_area_ha || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">ha Afectados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {filteredEvents.reduce((sum, e) => sum + (e.affected_farmers_count || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Agricultores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatCurrency(filteredEvents.reduce((sum, e) => sum + (e.estimated_loss_aoa || 0), 0))}
              </p>
              <p className="text-sm text-muted-foreground">Perdas Totais</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
