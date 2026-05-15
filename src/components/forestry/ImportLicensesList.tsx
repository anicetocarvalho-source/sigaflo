import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, FileText, Loader2, PackageSearch, User, Building2 } from 'lucide-react';
import { QueryError } from '@/components/ui/query-state';
import { useForestImportLicenses, type ForestImportLicense } from '@/hooks/useForestImportLicenses';
import { ImportLicenseForm } from './ImportLicenseForm';
import { ImportLicensePrintView } from './ImportLicensePrintView';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', submitted: 'Submetida', under_review: 'Em Análise',
  approved: 'Aprovada', issued: 'Emitida', rejected: 'Rejeitada',
  expired: 'Expirada', revoked: 'Revogada',
};
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  issued: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  revoked: 'bg-red-100 text-red-800',
};
const categoryLabels: Record<string, string> = {
  madeira: 'Madeira', sementes: 'Sementes', mudas: 'Mudas',
  fertilizantes: 'Fertilizantes', pesticidas: 'Pesticidas',
  equipamento: 'Equipamento', racao: 'Ração', outro: 'Outro',
};

export function ImportLicensesList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [selected, setSelected] = useState<ForestImportLicense | null>(null);

  const { data, isLoading, isError, error, refetch } = useForestImportLicenses({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    person_type: personFilter !== 'all' ? personFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const filtered = data?.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.license_number?.toLowerCase().includes(s) ||
      l.importer_name?.toLowerCase().includes(s) ||
      l.document_number?.toLowerCase().includes(s) ||
      l.origin_country?.toLowerCase().includes(s)
    );
  });

  const handleNew = () => { setSelected(null); setOpen(true); };
  const handleEdit = (l: ForestImportLicense) => { setSelected(l); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar importador, NIF, país..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Pessoa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Singular + Colectiva</SelectItem>
              <SelectItem value="singular">Pessoa Singular</SelectItem>
              <SelectItem value="colectiva">Pessoa Colectiva</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Licença de Importação
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        {isError ? (
          <QueryError error={error as Error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Sem licenças de importação</h3>
            <p className="mt-1 text-sm text-muted-foreground">Emita a primeira licença para importação de produtos agroflorestais.</p>
            <Button onClick={handleNew} className="mt-4"><Plus className="mr-2 h-4 w-4" /> Nova Licença</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Licença</TableHead>
                <TableHead>Importador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">{l.license_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{l.importer_name}</div>
                    <div className="text-xs text-muted-foreground">{l.document_number}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {l.person_type === 'singular' ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                      {l.person_type === 'singular' ? 'Singular' : 'Colectiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>{l.origin_country}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{categoryLabels[l.product_category] || l.product_category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(l.quantity).toLocaleString()} {l.unit}
                  </TableCell>
                  <TableCell>
                    {l.expiry_date ? format(new Date(l.expiry_date), 'dd/MM/yyyy', { locale: pt }) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[l.status]} variant="secondary">{statusLabels[l.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        title="Ver / Imprimir autorização"
                        onClick={() => { setSelected(l); setPrintOpen(true); }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(l)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ImportLicenseForm open={open} onClose={() => setOpen(false)} license={selected} />
      <ImportLicensePrintView open={printOpen} onClose={() => setPrintOpen(false)} license={selected} />
    </div>
  );
}
