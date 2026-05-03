import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, FileDown, Loader2, Sparkles, Search, Eye, ScanLine, BellRing } from 'lucide-react';
import { useGenerateCard, useCardStats, type CardStatus, type FarmerCard } from '@/hooks/useFarmerCards';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import CardBatchExportDialog from '@/components/farmers/CardBatchExportDialog';
import CardExportJobsPanel from '@/components/farmers/CardExportJobsPanel';
import CardActionsMenu from '@/components/farmers/CardActionsMenu';
import CardHistoryDrawer from '@/components/farmers/CardHistoryDrawer';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { QueryError, QueryEmpty } from '@/components/ui/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FarmerCard as FarmerCardComponent } from '@/components/farmers/FarmerCard';
import type { Farmer } from '@/hooks/useFarmers';

const STATUS_LABELS: Record<CardStatus, string> = {
  rascunho: 'Rascunho', gerado: 'Gerado', impresso: 'Impresso', entregue: 'Entregue', revogado: 'Revogado',
};

export default function CardsManagementPage() {
  const { data: stats } = useCardStats();
  const generate = useGenerateCard();
  const {
    provinces, municipalities,
    selectedProvinceId, selectedMunicipalityId,
    handleProvinceChange, handleMunicipalityChange,
  } = useLocationCascade();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{ id: string; name: string } | null>(null);
  const [printTarget, setPrintTarget] = useState<Farmer | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Server-side paginated farmers query (excludes coops & field schools)
  const farmersQuery = useQuery({
    queryKey: ['cards-page-farmers', { search, selectedProvinceId, selectedMunicipalityId, page, pageSize }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let q = supabase
        .from('farmers')
        .select(`
          *,
          provinces(name, code),
          municipalities(name),
          communes(name)
        `, { count: 'exact' })
        .neq('farmer_type', 'cooperative')
        .neq('farmer_type', 'field_school')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (selectedProvinceId) q = q.eq('province_id', selectedProvinceId);
      if (selectedMunicipalityId) q = q.eq('municipality_id', selectedMunicipalityId);
      if (search.trim()) q = q.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%`);
      const { data, count, error } = await q;
      if (error) throw error;
      return { rows: (data ?? []) as unknown as Farmer[], total: count ?? 0 };
    },
  });

  const farmers = farmersQuery.data?.rows ?? [];
  const totalCount = farmersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Cards for the visible page only
  const cardsQuery = useQuery({
    queryKey: ['cards-page-cards', farmers.map((f) => f.id)],
    queryFn: async () => {
      if (farmers.length === 0) return {} as Record<string, FarmerCard>;
      const { data, error } = await supabase
        .from('farmer_cards' as any)
        .select('id, farmer_id, card_status, serial, qr_token')
        .in('farmer_id', farmers.map((f) => f.id))
        .neq('card_status', 'revogado');
      if (error) throw error;
      const map: Record<string, FarmerCard> = {};
      (data ?? []).forEach((c: any) => { map[c.farmer_id] = c; });
      return map;
    },
    enabled: farmers.length > 0,
  });

  const cardsMap = cardsQuery.data ?? {};

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return farmers;
    return farmers.filter((f) => {
      const card = cardsMap[f.id];
      if (statusFilter === 'sem_cartao') return !card;
      return card?.card_status === statusFilter;
    });
  }, [farmers, cardsMap, statusFilter]);

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(filtered.map((f) => f.id)) : new Set());
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBatchGenerate = async () => {
    const targets = filtered.filter((f) => selected.has(f.id) && !cardsMap[f.id]);
    if (targets.length === 0) { toast.info('Selecione agricultores sem cartão emitido'); return; }
    if (targets.length > 500) {
      toast.info(`${targets.length} cartões — a usar processamento em fila no servidor`);
      const { data, error } = await supabase.functions.invoke('generate-cards-batch', {
        body: { farmer_ids: targets.map((t) => t.id) },
      });
      if (error) toast.error(error.message); else toast.success(`Job criado: ${(data as any)?.job_id}`);
      return;
    }
    let done = 0;
    for (const f of targets) { try { await generate.mutateAsync(f); done++; } catch {} }
    toast.success(`${done}/${targets.length} cartões gerados`);
    cardsQuery.refetch();
  };

  const selectedFarmers = useMemo(
    () => filtered.filter((f) => selected.has(f.id)),
    [filtered, selected],
  );

  const provinceData = Object.entries(stats?.byProvince ?? {})
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  const isLoading = farmersQuery.isLoading;
  const isError = farmersQuery.isError;

  return (
    <MainLayout
      title="Gestão de Cartões SIGAFLO"
      subtitle="Geração, impressão, entrega e auditoria de cartões de identidade do agricultor"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['gerado', 'impresso', 'entregue', 'revogado'] as CardStatus[]).map((s) => (
            <Card
              key={s}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats?.byStatus[s] ?? 0}</p></CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-primary">{stats?.total ?? 0}</p></CardContent>
          </Card>
        </div>

        {provinceData.length > 0 && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Emissão por Província</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link to="/notificacoes">
                  <BellRing className="h-4 w-4 mr-2" /> Notificações relacionadas
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={provinceData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Filtros + acções */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Pesquisar nome ou nº de registo"
                  value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <Select value={selectedProvinceId ?? 'all'} onValueChange={(v) => { handleProvinceChange(v === 'all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Província" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as províncias</SelectItem>
                  {provinces.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                value={selectedMunicipalityId ?? 'all'}
                onValueChange={(v) => { handleMunicipalityChange(v === 'all' ? '' : v); setPage(1); }}
                disabled={!selectedProvinceId}
              >
                <SelectTrigger className="w-48"><SelectValue placeholder="Município" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os municípios</SelectItem>
                  {municipalities.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="sem_cartao">Sem cartão</SelectItem>
                  <SelectItem value="gerado">Gerado</SelectItem>
                  <SelectItem value="impresso">Impresso</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Badge variant="secondary">{selected.size} seleccionado(s)</Badge>
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={handleBatchGenerate} disabled={!selected.size || generate.isPending}>
                  {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar cartões
                </Button>
                <Button size="sm" variant="outline" onClick={() => setExportDialogOpen(true)} disabled={!selected.size}>
                  <FileDown className="h-4 w-4 mr-2" /> Exportar lote (PDF/ZIP)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {isError && (
              <div className="p-4">
                <QueryError error={farmersQuery.error as Error} onRetry={() => farmersQuery.refetch()} />
              </div>
            )}

            {!isError && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={filtered.length > 0 && filtered.every((f) => selected.has(f.id))}
                          onCheckedChange={(c) => toggleAll(!!c)}
                        />
                      </TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Reg.</TableHead>
                      <TableHead>Província</TableHead>
                      <TableHead>Município</TableHead>
                      <TableHead>Cartão</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={`sk-${i}`}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {!isLoading && filtered.map((f) => {
                      const card = cardsMap[f.id];
                      return (
                        <TableRow key={f.id}>
                          <TableCell><Checkbox checked={selected.has(f.id)} onCheckedChange={() => toggleOne(f.id)} /></TableCell>
                          <TableCell className="font-medium">
                            <Link to={`/agricultores/${f.id}`} className="hover:underline inline-flex items-center gap-1">
                              {f.name} <Eye className="h-3 w-3 text-muted-foreground" />
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{f.registration_number ?? '—'}</TableCell>
                          <TableCell>{f.provinces?.name ?? '—'}</TableCell>
                          <TableCell>{f.municipalities?.name ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {card?.serial ? (
                              <a
                                href={`/verificacao/${card.qr_token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline inline-flex items-center gap-1"
                                title="Verificar QR público"
                              >
                                {card.serial} <ScanLine className="h-3 w-3 text-muted-foreground" />
                              </a>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            {card ? <Badge variant="secondary">{STATUS_LABELS[card.card_status as CardStatus]}</Badge>
                                  : <Badge variant="outline">Sem cartão</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {!card && (
                                <Button
                                  size="sm" variant="ghost" className="h-8"
                                  onClick={async () => { await generate.mutateAsync(f); cardsQuery.refetch(); }}
                                  disabled={generate.isPending}
                                >
                                  <Sparkles className="h-4 w-4 mr-1" /> Gerar
                                </Button>
                              )}
                              <CardActionsMenu
                                farmerId={f.id}
                                farmerName={f.name}
                                card={card as any}
                                onPrint={() => setPrintTarget(f)}
                                onShowHistory={() => { setHistoryTarget({ id: f.id, name: f.name }); setHistoryOpen(true); }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {!isLoading && filtered.length === 0 && (
                  <div className="p-6">
                    <QueryEmpty
                      icon={<CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />}
                      title="Nenhum agricultor encontrado"
                      description="Ajuste os filtros ou registe agricultores na lista principal."
                    />
                  </div>
                )}

                <div className="px-4 border-t">
                  <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <CardBatchExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          farmers={selectedFarmers}
          cardsMap={cardsMap}
        />

        <CardHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          farmerId={historyTarget?.id}
          farmerName={historyTarget?.name}
        />

        <Dialog open={!!printTarget} onOpenChange={(o) => !o && setPrintTarget(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cartão de {printTarget?.name}</DialogTitle>
            </DialogHeader>
            {printTarget && <FarmerCardComponent farmer={printTarget} />}
          </DialogContent>
        </Dialog>

        <CardExportJobsPanel />
      </div>
    </MainLayout>
  );
}
