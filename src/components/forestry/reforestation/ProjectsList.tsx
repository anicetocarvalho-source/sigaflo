import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Search, Plus, Eye, Edit, Trees } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ReforestationProject {
  id: string;
  project_name: string;
  project_code: string;
  status: string;
  target_area_ha: number;
  planted_area_ha: number;
  target_trees: number;
  planted_trees: number;
  survival_rate: number | null;
  start_date: string;
  end_date: string | null;
  province?: { name: string };
  implementing_entity?: string;
}

interface ProjectsListProps {
  projects: ReforestationProject[];
  isLoading: boolean;
  onAddNew: () => void;
  onView: (project: ReforestationProject) => void;
  onEdit: (project: ReforestationProject) => void;
}

const statusLabels: Record<string, string> = {
  planning: 'Planeamento',
  preparation: 'Preparação',
  planting: 'Plantação',
  monitoring: 'Monitorização',
  maintenance: 'Manutenção',
  completed: 'Concluído',
  suspended: 'Suspenso',
};

export function ProjectsList({ projects, isLoading, onAddNew, onView, onEdit }: ProjectsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter(proj => {
    const matchesSearch = 
      proj.project_name.toLowerCase().includes(search.toLowerCase()) ||
      proj.project_code?.toLowerCase().includes(search.toLowerCase()) ||
      proj.implementing_entity?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-500/20 text-blue-700',
      preparation: 'bg-purple-500/20 text-purple-700',
      planting: 'bg-green-500/20 text-green-700',
      monitoring: 'bg-yellow-500/20 text-yellow-700',
      maintenance: 'bg-orange-500/20 text-orange-700',
      completed: 'bg-emerald-500/20 text-emerald-700',
      suspended: 'bg-red-500/20 text-red-700',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar projectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Estados</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projecto
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome do Projecto</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Província</TableHead>
              <TableHead>Progresso Área</TableHead>
              <TableHead>Árvores</TableHead>
              <TableHead>Sobrevivência</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  A carregar projectos...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Trees className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhum projecto encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => {
                const areaProgress = project.target_area_ha > 0 
                  ? (project.planted_area_ha / project.target_area_ha) * 100 
                  : 0;
                const treeProgress = project.target_trees > 0 
                  ? (project.planted_trees / project.target_trees) * 100 
                  : 0;

                return (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(project)}>
                    <TableCell className="font-mono text-sm">{project.project_code}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{project.project_name}</TableCell>
                    <TableCell>{project.implementing_entity || '-'}</TableCell>
                    <TableCell>{project.province?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{project.planted_area_ha.toLocaleString()} ha</span>
                          <span className="text-muted-foreground">/ {project.target_area_ha.toLocaleString()}</span>
                        </div>
                        <Progress value={areaProgress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{project.planted_trees.toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs"> / {project.target_trees.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.survival_rate != null ? (
                        <Badge variant={project.survival_rate >= 70 ? 'default' : 'destructive'}>
                          {project.survival_rate}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onView(project); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
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
    </div>
  );
}
