import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Coffee,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  MapPin,
  Award,
  FileText,
  Eye,
  Edit,
} from 'lucide-react';
import { CoffeeLot } from '@/hooks/useCoffee';
import { getSemaphoreStatus, SemaphoreStatus } from './CoffeeSemaphoreKPIs';

interface Props {
  lots: CoffeeLot[];
  onSelectLot: (lot: CoffeeLot) => void;
  onEditLot: (lot: CoffeeLot) => void;
}

const semaphoreConfig: Record<SemaphoreStatus, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  green: { 
    label: 'Verde', 
    icon: CheckCircle2, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-500',
  },
  yellow: { 
    label: 'Amarelo', 
    icon: AlertTriangle, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-500',
  },
  red: { 
    label: 'Vermelho', 
    icon: XCircle, 
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-500',
  },
  unclassified: { 
    label: 'Por Classificar', 
    icon: Package, 
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    borderColor: 'border-slate-400',
  },
};

const getComplianceDetails = (lot: CoffeeLot) => {
  const checks = [
    { label: 'Qualidade', passed: !!lot.quality_grade },
    { label: 'Exportador', passed: !!lot.exporter_name },
    { label: 'Destino', passed: !!lot.destination_country },
    { label: 'Doc. Transporte', passed: !!lot.transport_document_number },
    { label: 'Dec. Exportação', passed: !!lot.export_declaration_number },
  ];
  
  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length };
};

export function CoffeeSemaphoreList({ lots, onSelectLot, onEditLot }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SemaphoreStatus | 'all'>('all');

  const filteredLots = lots.filter(lot => {
    const matchesSearch = !search || 
      lot.lot_code.toLowerCase().includes(search.toLowerCase()) ||
      lot.origin_location?.toLowerCase().includes(search.toLowerCase());
    
    const semaphore = getSemaphoreStatus(lot);
    const matchesStatus = statusFilter === 'all' || semaphore === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          Classificação de Lotes
        </CardTitle>
        <CardDescription>
          Sistema de semaforização para controlo de qualidade e exportação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por código ou origem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SemaphoreStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por sinal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Sinais</SelectItem>
              <SelectItem value="green">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Verde
                </span>
              </SelectItem>
              <SelectItem value="yellow">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Amarelo
                </span>
              </SelectItem>
              <SelectItem value="red">
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Vermelho
                </span>
              </SelectItem>
              <SelectItem value="unclassified">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-600" />
                  Por Classificar
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Sinal</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Qualidade</TableHead>
                <TableHead>Conformidade</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Coffee className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum lote encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLots.map((lot) => {
                  const semaphore = getSemaphoreStatus(lot);
                  const config = semaphoreConfig[semaphore];
                  const Icon = config.icon;
                  const compliance = getComplianceDetails(lot);

                  return (
                    <TableRow 
                      key={lot.id} 
                      className={`${config.bgColor} border-l-4 ${config.borderColor}`}
                    >
                      <TableCell>
                        <div className={`flex items-center justify-center ${config.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-amber-600" />
                          <span className="font-medium">{lot.lot_code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {lot.origin_province?.name || lot.origin_location || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lot.quality_grade ? (
                          <Badge variant="outline" className="gap-1">
                            <Award className="h-3 w-3" />
                            {lot.quality_grade}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {compliance.checks.map((check, i) => (
                              <div
                                key={i}
                                className={`h-2 w-2 rounded-full ${
                                  check.passed 
                                    ? 'bg-emerald-500' 
                                    : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                                title={check.label}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {compliance.passed}/{compliance.total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{lot.volume_kg.toLocaleString()} kg</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onSelectLot(lot)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEditLot(lot)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
