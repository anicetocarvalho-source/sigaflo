import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, FileDown, Loader2, Sparkles, Search } from 'lucide-react';
import { useFarmers, useProvinces, type Farmer } from '@/hooks/useFarmers';
import { useGenerateCard, useCardStats, type CardStatus } from '@/hooks/useFarmerCards';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import CardBatchExportDialog from '@/components/farmers/CardBatchExportDialog';

const STATUS_LABELS: Record<CardStatus, string> = {
  rascunho: 'Rascunho', gerado: 'Gerado', impresso: 'Impresso', entregue: 'Entregue', revogado: 'Revogado',
};

export default function CardsManagementPage() {
  const { data: farmers = [], isLoading } = useFarmers({ excludeTypes: ['cooperative', 'field_school'] as any });
  const { data: provinces = [] } = useProvinces();
  const { data: stats } = useCardStats();
  const generate = useGenerateCard();

  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchExporting, setBatchExporting] = useState(false);

  // Get cards map
  const { data: cardsMap = {} } = useQuery({
    queryKey: ['cards-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_cards' as any)
        .select('farmer_id, card_status, serial, qr_token')
        .neq('card_status', 'revogado');
      if (error) throw error;
      const map: Record<string, any> = {};
      (data ?? []).forEach((c: any) => { map[c.farmer_id] = c; });
      return map;
    },
  });

  const filtered = useMemo(() => {
    return farmers.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
          !(f.registration_number ?? '').toLowerCase().includes(search.toLowerCase())) return false;
      if (provinceFilter !== 'all' && f.province_id !== provinceFilter) return false;
      if (statusFilter !== 'all') {
        const card = cardsMap[f.id];
        if (statusFilter === 'sem_cartao' && card) return false;
        if (statusFilter !== 'sem_cartao' && card?.card_status !== statusFilter) return false;
      }
      return true;
    });
  }, [farmers, search, provinceFilter, statusFilter, cardsMap]);

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map((f) => f.id)) : new Set());
  };
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
    for (const f of targets) {
      try { await generate.mutateAsync(f); done++; } catch {}
    }
    toast.success(`${done}/${targets.length} cartões gerados`);
  };

  const handleBatchExportPdf = async () => {
    const targets = filtered.filter((f) => selected.has(f.id));
    if (!targets.length) return;
    setBatchExporting(true);
    try {
      // A4 landscape, 10 cartões por página (5 colunas x 2 linhas)
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const cardW = 85.6, cardH = 53.98;
      const cols = 3, rows = 3; // mais espaço para guias
      const pageW = 297, pageH = 210;
      const totalW = cols * cardW + (cols - 1) * 4;
      const totalH = rows * cardH + (rows - 1) * 4;
      const offsetX = (pageW - totalW) / 2;
      const offsetY = (pageH - totalH) / 2;
      let i = 0;
      for (const f of targets) {
        const idx = i % (cols * rows);
        if (i > 0 && idx === 0) pdf.addPage();
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = offsetX + col * (cardW + 4);
        const y = offsetY + row * (cardH + 4);
        // moldura + dados básicos
        pdf.setDrawColor(150); pdf.setLineDashPattern([1, 1], 0);
        pdf.rect(x - 1, y - 1, cardW + 2, cardH + 2);
        pdf.setLineDashPattern([], 0);
        pdf.setFillColor(22, 163, 74);
        pdf.rect(x, y, cardW, 10, 'F');
        pdf.setTextColor(255).setFontSize(9).setFont('helvetica', 'bold');
        pdf.text('SIGAFLO · CARTÃO DE AGRICULTOR', x + 3, y + 6.5);
        pdf.setTextColor(0).setFont('helvetica', 'bold').setFontSize(11);
        pdf.text(f.name.slice(0, 32), x + 3, y + 18);
        pdf.setFont('helvetica', 'normal').setFontSize(8);
        pdf.text(`Reg: ${f.registration_number ?? '—'}`, x + 3, y + 24);
        pdf.text(`${f.provinces?.name ?? ''} / ${f.municipalities?.name ?? ''}`.slice(0, 40), x + 3, y + 30);
        pdf.text(`Cultura: ${(f.main_crops?.[0]) ?? '—'}`, x + 3, y + 36);
        pdf.text(`Área: ${f.cultivated_area_ha ?? 0} ha`, x + 3, y + 42);
        const card = cardsMap[f.id];
        if (card?.serial) {
          pdf.setFont('courier', 'normal').setFontSize(7);
          pdf.text(card.serial, x + 3, y + 50);
        }
        i++;
      }
      pdf.save(`cartoes-sigaflo-${Date.now()}.pdf`);
      toast.success(`${targets.length} cartões exportados`);
    } finally {
      setBatchExporting(false);
    }
  };

  const provinceData = Object.entries(stats?.byProvince ?? {})
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gestão de Cartões</h1>
          <p className="text-sm text-muted-foreground">Geração, impressão, entrega e auditoria de cartões SIGAFLO</p>
        </div>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['gerado', 'impresso', 'entregue', 'revogado'] as CardStatus[]).map((s) => (
          <Card key={s}>
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
          <CardHeader><CardTitle>Emissão por Província</CardTitle></CardHeader>
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

      {/* Filtros + ações */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Pesquisar nome ou nº de registo" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Província" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as províncias</SelectItem>
                {provinces.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Gerar cartões
              </Button>
              <Button size="sm" variant="outline" onClick={handleBatchExportPdf} disabled={!selected.size || batchExporting}>
                {batchExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Exportar PDF agrupado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">A carregar...</div>
          ) : (
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
                  <TableHead>Cartão</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map((f) => {
                  const card = cardsMap[f.id];
                  return (
                    <TableRow key={f.id}>
                      <TableCell><Checkbox checked={selected.has(f.id)} onCheckedChange={() => toggleOne(f.id)} /></TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="font-mono text-xs">{f.registration_number ?? '—'}</TableCell>
                      <TableCell>{f.provinces?.name ?? '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{card?.serial ?? '—'}</TableCell>
                      <TableCell>
                        {card ? <Badge variant="secondary">{STATUS_LABELS[card.card_status as CardStatus]}</Badge>
                              : <Badge variant="outline">Sem cartão</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {filtered.length > 200 && (
            <div className="p-3 text-xs text-muted-foreground text-center border-t">
              A mostrar 200 de {filtered.length} resultados — refine os filtros
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
