import { useEffect, useRef, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { TreePine, Radio, Search, Download, Plus, Edit, Eye, LogOut, QrCode, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

type TreeStatus = 'saudavel' | 'em_risco' | 'doente' | 'removida';

interface Tree {
  id: string;
  rfid_code: string;
  concession_id: string | null;
  common_name: string | null;
  scientific_name: string | null;
  species: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  planting_date: string | null;
  status: TreeStatus;
  height: number | null;
  trunk_diameter: number | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Concession {
  id: string;
  inventory_code: string;
  concession_name: string;
  forest_type: string | null;
  total_area_ha: number | null;
  dominant_species: string[] | null;
}

const STATUS_LABELS: Record<TreeStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  saudavel: { label: 'Saudável', variant: 'default' },
  em_risco: { label: 'Em risco', variant: 'secondary' },
  doente: { label: 'Doente', variant: 'destructive' },
  removida: { label: 'Removida', variant: 'outline' },
};

const emptyForm = {
  rfid_code: '',
  common_name: '',
  scientific_name: '',
  species: '',
  location: '',
  latitude: '',
  longitude: '',
  planting_date: '',
  status: 'saudavel' as TreeStatus,
  height: '',
  trunk_diameter: '',
  notes: '',
  photo_url: '',
};

export default function TreesRfidPage() {
  const [concessionCodeInput, setConcessionCodeInput] = useState('');
  const [concession, setConcession] = useState<Concession | null>(null);
  const [loadingConcession, setLoadingConcession] = useState(false);

  const [trees, setTrees] = useState<Tree[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [rfidInput, setRfidInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [detailTree, setDetailTree] = useState<Tree | null>(null);

  const rfidInputRef = useRef<HTMLInputElement>(null);
  const concessionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!concession) {
      concessionInputRef.current?.focus();
    } else if (!formOpen && !detailTree) {
      rfidInputRef.current?.focus();
    }
  }, [concession, formOpen, detailTree]);

  // Install prompt (PWA)
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    document.title = 'Leitor RFID Árvores | SIGAFLO';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Leitor RFID/QR para cadastro e gestão de árvores em concessões florestais.');

    // Swap manifest to the dedicated RFID PWA manifest while on this page
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const original = link?.getAttribute('href') ?? '/manifest.webmanifest';
    if (link) link.setAttribute('href', '/manifest-rfid.webmanifest');

    // theme-color for the RFID app
    let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const originalTheme = themeMeta?.getAttribute('content') ?? '';
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', '#047857');

    const onBip = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);

    // Detect if already running as installed PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    return () => {
      if (link) link.setAttribute('href', original);
      if (themeMeta) themeMeta.setAttribute('content', originalTheme);
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      toast.message('Instalação', {
        description:
          'No iPhone: toque em Partilhar → "Adicionar ao ecrã principal". No Android: menu do navegador → "Instalar aplicação".',
      });
      return;
    }
    installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice?.outcome === 'accepted') {
      toast.success('Aplicação instalada');
    }
    setInstallEvent(null);
  };

  const loadTrees = async (concessionId: string) => {
    setLoadingTrees(true);
    const { data, error } = await supabase
      .from('trees')
      .select('*')
      .eq('concession_id', concessionId)
      .order('created_at', { ascending: false });
    setLoadingTrees(false);
    if (error) {
      toast.error('Erro ao carregar árvores');
      return;
    }
    setTrees((data as Tree[]) || []);
  };

  const handleLoadConcession = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = concessionCodeInput.trim();
    if (!code) {
      toast.error('Insira o código da concessão');
      return;
    }
    setLoadingConcession(true);
    const { data, error } = await supabase
      .from('forest_inventory')
      .select('id, inventory_code, concession_name, forest_type, total_area_ha, dominant_species')
      .ilike('inventory_code', code)
      .maybeSingle();
    setLoadingConcession(false);
    if (error || !data) {
      toast.error('Concessão não encontrada');
      return;
    }
    setConcession(data as Concession);
    toast.success(`Concessão: ${data.concession_name}`);
    await loadTrees(data.id);
  };

  const handleRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = rfidInput.trim();
    if (!code || !concession) return;

    const { data, error } = await supabase
      .from('trees')
      .select('*')
      .eq('rfid_code', code)
      .maybeSingle();

    if (error) {
      toast.error('Erro ao pesquisar tag RFID');
      return;
    }

    if (data) {
      openEdit(data as Tree);
      toast.info('Tag existente — edite os dados');
    } else {
      setEditingId(null);
      setForm({ ...emptyForm, rfid_code: code });
      setFormOpen(true);
    }
    setRfidInput('');
  };

  const openEdit = (tree: Tree) => {
    setEditingId(tree.id);
    setForm({
      rfid_code: tree.rfid_code,
      common_name: tree.common_name ?? '',
      scientific_name: tree.scientific_name ?? '',
      species: tree.species ?? '',
      location: tree.location ?? '',
      latitude: tree.latitude?.toString() ?? '',
      longitude: tree.longitude?.toString() ?? '',
      planting_date: tree.planting_date ?? '',
      status: tree.status,
      height: tree.height?.toString() ?? '',
      trunk_diameter: tree.trunk_diameter?.toString() ?? '',
      notes: tree.notes ?? '',
      photo_url: tree.photo_url ?? '',
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concession) return;
    if (!form.rfid_code.trim()) {
      toast.error('Código RFID obrigatório');
      return;
    }
    setSaving(true);

    const payload = {
      rfid_code: form.rfid_code.trim(),
      concession_id: concession.id,
      common_name: form.common_name || null,
      scientific_name: form.scientific_name || null,
      species: form.species || null,
      location: form.location || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      planting_date: form.planting_date || null,
      status: form.status,
      height: form.height ? parseFloat(form.height) : null,
      trunk_diameter: form.trunk_diameter ? parseFloat(form.trunk_diameter) : null,
      notes: form.notes || null,
      photo_url: form.photo_url || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('trees').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('trees').insert(payload));
    }

    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        toast.error('Já existe uma árvore com este código RFID');
      } else {
        toast.error('Erro ao guardar: ' + error.message);
      }
      return;
    }

    toast.success(editingId ? 'Árvore actualizada' : 'Árvore cadastrada com sucesso');
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    await loadTrees(concession.id);
  };

  const filteredTrees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trees.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        t.rfid_code.toLowerCase().includes(q) ||
        (t.common_name ?? '').toLowerCase().includes(q) ||
        (t.species ?? '').toLowerCase().includes(q) ||
        (t.location ?? '').toLowerCase().includes(q)
      );
    });
  }, [trees, search, statusFilter]);

  const exportCSV = () => {
    if (filteredTrees.length === 0) {
      toast.error('Sem dados para exportar');
      return;
    }
    const headers = [
      'rfid_code', 'common_name', 'scientific_name', 'species', 'location',
      'latitude', 'longitude', 'planting_date', 'status', 'height',
      'trunk_diameter', 'notes', 'created_at',
    ];
    const rows = filteredTrees.map((t) =>
      headers.map((h) => {
        const v = (t as any)[h];
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arvores_${concession?.inventory_code ?? 'export'}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportQrPDF = async (mode: 'trees' | 'access') => {
    try {
      const items: { code: string; label: string; sub?: string }[] =
        mode === 'access'
          ? Array.from({ length: 12 }).map(() => ({
              code: `${window.location.origin}/rfid-arvores`,
              label: 'Leitor RFID Árvores',
              sub: concession?.inventory_code ?? '',
            }))
          : filteredTrees.map((t) => ({
              code: t.rfid_code,
              label: t.common_name || t.species || 'Árvore',
              sub: t.rfid_code,
            }));

      if (items.length === 0) {
        toast.error('Sem dados para exportar');
        return;
      }

      // A4 portrait, 3 cols x 4 rows = 12 etiquetas por página
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const cols = 3;
      const rows = 4;
      const marginX = 10;
      const marginY = 12;
      const cellW = (pageW - marginX * 2) / cols;
      const cellH = (pageH - marginY * 2) / rows;
      const qrSize = 38;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const posInPage = i % (cols * rows);
        if (i > 0 && posInPage === 0) doc.addPage();

        const col = posInPage % cols;
        const row = Math.floor(posInPage / cols);
        const x = marginX + col * cellW;
        const y = marginY + row * cellH;

        // borda tracejada (corte)
        doc.setDrawColor(180);
        doc.setLineDashPattern([1, 1], 0);
        doc.rect(x + 1, y + 1, cellW - 2, cellH - 2);
        doc.setLineDashPattern([], 0);

        const qrDataUrl = await QRCode.toDataURL(it.code, {
          margin: 0,
          width: 400,
          errorCorrectionLevel: 'H',
        });
        const qrX = x + (cellW - qrSize) / 2;
        const qrY = y + 4;
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(it.label.slice(0, 28), x + cellW / 2, qrY + qrSize + 5, { align: 'center' });
        if (it.sub) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text(it.sub.slice(0, 32), x + cellW / 2, qrY + qrSize + 10, { align: 'center' });
        }
      }

      const name =
        mode === 'access'
          ? `qr_leitor_rfid_${concession?.inventory_code ?? 'sigaflo'}.pdf`
          : `qr_arvores_${concession?.inventory_code ?? 'export'}_${Date.now()}.pdf`;
      doc.save(name);
      toast.success('PDF gerado com sucesso');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF');
    }
  };

  const resetConcession = () => {
    setConcession(null);
    setConcessionCodeInput('');
    setTrees([]);
  };

  if (!concession) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-200">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <TreePine className="h-7 w-7 text-emerald-700" />
            </div>
            <CardTitle className="text-2xl">Cadastro de Árvores por RFID</CardTitle>
            <p className="text-sm text-muted-foreground">
              Insira o código da concessão florestal para começar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoadConcession} className="space-y-4">
              <div>
                <Label htmlFor="conc">Código da Concessão</Label>
                <Input
                  id="conc"
                  ref={concessionInputRef}
                  value={concessionCodeInput}
                  onChange={(e) => setConcessionCodeInput(e.target.value)}
                  placeholder="Ex: CONC-2025-0001"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loadingConcession}>
                {loadingConcession ? 'A pesquisar...' : 'Entrar'}
              </Button>
              {!isInstalled && (
                <Button type="button" variant="outline" className="w-full" onClick={handleInstall}>
                  <Download className="h-4 w-4 mr-1" /> Instalar como aplicação
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <header className="bg-emerald-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TreePine className="h-7 w-7" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Cadastro de Árvores por RFID</h1>
              <p className="text-xs text-emerald-100">
                {concession.inventory_code} — {concession.concession_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isInstalled && (
              <Button variant="secondary" size="sm" onClick={handleInstall}>
                <Download className="h-4 w-4 mr-1" /> Instalar app
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={resetConcession}>
              <LogOut className="h-4 w-4 mr-1" /> Trocar concessão
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Tipo:</span> <strong>{concession.forest_type ?? '—'}</strong></div>
            <div><span className="text-muted-foreground">Área:</span> <strong>{concession.total_area_ha ?? '—'} ha</strong></div>
            <div className="col-span-2"><span className="text-muted-foreground">Espécies:</span> <strong>{(concession.dominant_species ?? []).join(', ') || '—'}</strong></div>
          </CardContent>
        </Card>

        <Card className="border-emerald-300 border-2">
          <CardContent className="pt-6">
            <form onSubmit={handleRfidSubmit} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                  <Radio className="h-6 w-6 text-emerald-700" />
                </div>
                <p className="font-medium text-emerald-900">Aproxime ou leia a tag RFID</p>
              </div>
              <div className="flex gap-2">
                <Input
                  ref={rfidInputRef}
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="Código RFID"
                  className="text-lg font-mono"
                  autoComplete="off"
                />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Ler
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setEditingId(null);
                  setForm({ ...emptyForm });
                  setFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Nova
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle>Árvores Cadastradas ({filteredTrees.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar..."
                    className="pl-8 w-56"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos estados</SelectItem>
                    <SelectItem value="saudavel">Saudável</SelectItem>
                    <SelectItem value="em_risco">Em risco</SelectItem>
                    <SelectItem value="doente">Doente</SelectItem>
                    <SelectItem value="removida">Removida</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-1" /> Exportar CSV
                </Button>
                <Button variant="outline" onClick={() => exportQrPDF('trees')}>
                  <FileDown className="h-4 w-4 mr-1" /> QRs Árvores (PDF)
                </Button>
                <Button variant="outline" onClick={() => exportQrPDF('access')}>
                  <QrCode className="h-4 w-4 mr-1" /> QR Leitor (PDF)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTrees ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : filteredTrees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma árvore cadastrada</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFID</TableHead>
                      <TableHead>Nome comum</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrees.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">{t.rfid_code}</TableCell>
                        <TableCell>{t.common_name ?? '—'}</TableCell>
                        <TableCell>{t.species ?? '—'}</TableCell>
                        <TableCell>{t.location ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_LABELS[t.status].variant}>
                            {STATUS_LABELS[t.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => setDetailTree(t)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditingId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar árvore' : 'Nova árvore'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Código RFID *</Label>
                <Input
                  value={form.rfid_code}
                  onChange={(e) => setForm({ ...form, rfid_code: e.target.value })}
                  disabled={!!editingId || !!form.rfid_code}
                  required
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Nome comum</Label>
                <Input value={form.common_name} onChange={(e) => setForm({ ...form, common_name: e.target.value })} />
              </div>
              <div>
                <Label>Nome científico</Label>
                <Input value={form.scientific_name} onChange={(e) => setForm({ ...form, scientific_name: e.target.value })} />
              </div>
              <div>
                <Label>Espécie</Label>
                <Input value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} />
              </div>
              <div>
                <Label>Localização</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <Label>Latitude</Label>
                <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
              <div>
                <Label>Data de plantação</Label>
                <Input type="date" value={form.planting_date} onChange={(e) => setForm({ ...form, planting_date: e.target.value })} />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TreeStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saudavel">Saudável</SelectItem>
                    <SelectItem value="em_risco">Em risco</SelectItem>
                    <SelectItem value="doente">Doente</SelectItem>
                    <SelectItem value="removida">Removida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Altura aproximada (m)</Label>
                <Input type="number" step="any" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              </div>
              <div>
                <Label>Diâmetro do tronco (cm)</Label>
                <Input type="number" step="any" value={form.trunk_diameter} onChange={(e) => setForm({ ...form, trunk_diameter: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Foto (URL)</Label>
                <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                {saving ? 'A guardar...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailTree} onOpenChange={(o) => !o && setDetailTree(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da árvore</DialogTitle>
          </DialogHeader>
          {detailTree && (
            <div className="space-y-2 text-sm">
              {detailTree.photo_url && (
                <img src={detailTree.photo_url} alt={detailTree.common_name ?? 'Árvore'} className="w-full rounded-md max-h-64 object-cover" />
              )}
              <p><strong>RFID:</strong> <span className="font-mono">{detailTree.rfid_code}</span></p>
              <p><strong>Nome comum:</strong> {detailTree.common_name ?? '—'}</p>
              <p><strong>Nome científico:</strong> {detailTree.scientific_name ?? '—'}</p>
              <p><strong>Espécie:</strong> {detailTree.species ?? '—'}</p>
              <p><strong>Localização:</strong> {detailTree.location ?? '—'}</p>
              <p><strong>Coordenadas:</strong> {detailTree.latitude ?? '—'}, {detailTree.longitude ?? '—'}</p>
              <p><strong>Plantação:</strong> {detailTree.planting_date ?? '—'}</p>
              <p><strong>Estado:</strong> <Badge variant={STATUS_LABELS[detailTree.status].variant}>{STATUS_LABELS[detailTree.status].label}</Badge></p>
              <p><strong>Altura:</strong> {detailTree.height ?? '—'} m</p>
              <p><strong>Diâmetro:</strong> {detailTree.trunk_diameter ?? '—'} cm</p>
              {detailTree.notes && <p><strong>Observações:</strong> {detailTree.notes}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTree(null)}>Fechar</Button>
            {detailTree && (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { openEdit(detailTree); setDetailTree(null); }}>
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
