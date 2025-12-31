import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Play, 
  Pause,
  Calendar,
  Users,
  Coins
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IncentiveProgram, useUpdateProgram } from '@/hooks/useIncentives';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ProgramsListProps {
  programs: IncentiveProgram[];
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  active: { label: 'Ativo', variant: 'default' },
  suspended: { label: 'Suspenso', variant: 'destructive' },
  completed: { label: 'Concluído', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  subsidy: { label: 'Subsídio', color: 'bg-green-500/10 text-green-700' },
  credit: { label: 'Crédito', color: 'bg-blue-500/10 text-blue-700' },
  tax_benefit: { label: 'Benefício Fiscal', color: 'bg-purple-500/10 text-purple-700' },
  technical_support: { label: 'Apoio Técnico', color: 'bg-orange-500/10 text-orange-700' },
};

const sectorConfig: Record<string, string> = {
  agriculture: 'Agricultura',
  forestry: 'Florestal',
  coffee: 'Café',
  rice: 'Arroz',
};

export function ProgramsList({ programs, onSelect, onEdit }: ProgramsListProps) {
  const updateProgram = useUpdateProgram();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateProgram.mutate({ id, status: newStatus as IncentiveProgram['status'] });
  };

  if (programs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Nenhum programa criado</h3>
          <p className="text-sm text-muted-foreground">
            Crie o primeiro programa de incentivos para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {programs.map((program) => {
        const executionRate = program.budget_aoa 
          ? (program.disbursed_aoa / program.budget_aoa) * 100 
          : 0;
        const allocationRate = program.budget_aoa 
          ? (program.allocated_aoa / program.budget_aoa) * 100 
          : 0;

        return (
          <Card key={program.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusConfig[program.status]?.variant || 'secondary'}>
                      {statusConfig[program.status]?.label || program.status}
                    </Badge>
                    <Badge className={typeConfig[program.program_type]?.color}>
                      {typeConfig[program.program_type]?.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <p className="text-sm text-muted-foreground">{program.code}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelect(program.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(program.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {program.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(program.id, 'active')}>
                        <Play className="h-4 w-4 mr-2" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {program.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(program.id, 'suspended')}>
                        <Pause className="h-4 w-4 mr-2" />
                        Suspender
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {program.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {program.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Período</p>
                    <p className="font-medium">
                      {format(new Date(program.start_date), 'MMM yyyy', { locale: pt })}
                      {program.end_date && ` - ${format(new Date(program.end_date), 'MMM yyyy', { locale: pt })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Beneficiários</p>
                    <p className="font-medium">
                      {program.actual_beneficiaries}
                      {program.target_beneficiaries && ` / ${program.target_beneficiaries}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Setor</p>
                    <p className="font-medium">{sectorConfig[program.sector] || program.sector}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Orçamento</span>
                  <span className="font-medium">{formatCurrency(program.budget_aoa || 0)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Alocado: {formatCurrency(program.allocated_aoa)}</span>
                    <span>{allocationRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={allocationRate} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Desembolsado: {formatCurrency(program.disbursed_aoa)}</span>
                    <span>{executionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={executionRate} className="h-1.5 [&>div]:bg-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
