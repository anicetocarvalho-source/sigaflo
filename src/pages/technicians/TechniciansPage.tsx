import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Users, MapPin, Phone, Mail, Eye, UserPlus, Trash2 } from 'lucide-react';
import { useTechnicians, FieldTechnician } from '@/hooks/useTechnicians';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { useAuth } from '@/contexts/AuthContext';
import { AssignFarmersDialog } from '@/components/technicians/AssignFarmersDialog';
import { Link } from 'react-router-dom';

const SPECIALIZATIONS = [
  { value: 'general', label: 'Geral' },
  { value: 'crops', label: 'Culturas' },
  { value: 'livestock', label: 'Pecuária' },
  { value: 'forestry', label: 'Florestal' },
  { value: 'irrigation', label: 'Irrigação' },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  on_leave: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  on_leave: 'Em Licença',
};

export default function TechniciansPage() {
  const { technicians, isLoading, createTechnician, deleteTechnician, assignFarmers } = useTechnicians();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [assignTarget, setAssignTarget] = useState<FieldTechnician | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    specialization: 'general',
    province_id: '',
    municipality_id: '',
    max_farmers: 150,
    notes: '',
  });

  const { provinces, municipalities } = useLocationCascade(form.province_id, '');

  const filtered = technicians.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.employee_number.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: technicians.length,
    active: technicians.filter(t => t.status === 'active').length,
    totalFarmers: technicians.reduce((sum, t) => sum + (t.assigned_farmers_count || 0), 0),
    avgLoad: technicians.length > 0
      ? Math.round(technicians.reduce((sum, t) => sum + (t.assigned_farmers_count || 0), 0) / technicians.length)
      : 0,
  };

  const handleCreate = () => {
    createTechnician.mutate({
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      specialization: form.specialization,
      province_id: form.province_id || null,
      municipality_id: form.municipality_id || null,
      max_farmers: form.max_farmers,
      notes: form.notes || null,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ full_name: '', phone: '', email: '', specialization: 'general', province_id: '', municipality_id: '', max_farmers: 150, notes: '' });
      },
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Técnicos de Campo</h1>
            <p className="text-muted-foreground">Gestão de extensionistas e atribuição de agricultores</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Novo Técnico
            </Button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Técnicos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Agricultores Atribuídos</p>
              <p className="text-2xl font-bold">{stats.totalFarmers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Média por Técnico</p>
              <p className="text-2xl font-bold">{stats.avgLoad}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar técnico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialização</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Agricultores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum técnico encontrado</TableCell></TableRow>
                ) : filtered.map(tech => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-mono text-xs">{tech.employee_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tech.full_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {tech.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{tech.phone}</span>}
                          {tech.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{tech.email}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{SPECIALIZATIONS.find(s => s.value === tech.specialization)?.label || tech.specialization}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {(tech.provinces as any)?.name || '—'}
                        {(tech.municipalities as any)?.name ? ` / ${(tech.municipalities as any).name}` : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tech.assigned_farmers_count || 0}</span>
                        <span className="text-xs text-muted-foreground">/ {tech.max_farmers}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[tech.status] || ''}>{statusLabels[tech.status] || tech.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/tecnicos/${tech.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => setAssignTarget(tech)}>
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              if (confirm('Remover este técnico?')) deleteTechnician.mutate(tech.id);
                            }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Técnico de Campo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Especialização</Label>
                <Select value={form.specialization} onValueChange={v => setForm(f => ({ ...f, specialization: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Máx. Agricultores</Label>
                <Input type="number" value={form.max_farmers} onChange={e => setForm(f => ({ ...f, max_farmers: parseInt(e.target.value) || 150 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Província</Label>
                <Select value={form.province_id} onValueChange={v => setForm(f => ({ ...f, province_id: v, municipality_id: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {provinces.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Município</Label>
                <Select value={form.municipality_id} onValueChange={v => setForm(f => ({ ...f, municipality_id: v }))} disabled={!form.province_id}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {municipalities.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.full_name || createTechnician.isPending}>
              {createTechnician.isPending ? 'A criar...' : 'Criar Técnico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Farmers Dialog */}
      {assignTarget && (
        <AssignFarmersDialog
          open={!!assignTarget}
          onOpenChange={() => setAssignTarget(null)}
          technicianId={assignTarget.id}
          technicianName={assignTarget.full_name}
          onAssign={(farmerIds) => {
            assignFarmers.mutate({ technicianId: assignTarget.id, farmerIds }, {
              onSuccess: () => setAssignTarget(null),
            });
          }}
          isAssigning={assignFarmers.isPending}
        />
      )}
    </MainLayout>
  );
}
