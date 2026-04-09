import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, FileText, AlertTriangle, Settings, Search, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useInsurance } from '@/hooks/useInsurance';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const policyStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};
const policyStatusLabels: Record<string, string> = { active: 'Activa', expired: 'Expirada', cancelled: 'Cancelada' };

const claimStatusColors: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-purple-100 text-purple-800',
};
const claimStatusLabels: Record<string, string> = { submitted: 'Submetido', under_review: 'Em Análise', approved: 'Aprovado', rejected: 'Rejeitado', paid: 'Pago' };

const eventTypes = [
  { value: 'drought', label: 'Seca' },
  { value: 'flood', label: 'Inundação' },
  { value: 'pest', label: 'Praga' },
  { value: 'storm', label: 'Tempestade' },
  { value: 'hail', label: 'Granizo' },
  { value: 'other', label: 'Outro' },
];

export default function InsurancePage() {
  const { policies, policiesLoading, claims, claimsLoading, rules, rulesLoading, createPolicy, createClaim, updateClaim, createRule, updateRule, deleteRule, stats, formatCurrency } = useInsurance();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);

  const [policyForm, setPolicyForm] = useState({ farmer_id: '', crop: '', area_ha: '', sum_insured_aoa: '', premium_aoa: '', coverage_start: '', coverage_end: '', policy_type: 'parametric' });
  const [claimForm, setClaimForm] = useState({ policy_id: '', farmer_id: '', event_type: 'drought', event_date: '', description: '', affected_area_ha: '', estimated_loss_aoa: '' });
  const [ruleForm, setRuleForm] = useState({ rule_name: '', rule_type: 'ndvi', parameter: 'ndvi_value', operator: '<', threshold_value: '', payout_percentage: '100', crop: '', description: '' });

  const handleCreatePolicy = () => {
    createPolicy.mutate({
      farmer_id: policyForm.farmer_id,
      crop: policyForm.crop,
      area_ha: parseFloat(policyForm.area_ha),
      sum_insured_aoa: parseFloat(policyForm.sum_insured_aoa),
      premium_aoa: parseFloat(policyForm.premium_aoa),
      coverage_start: policyForm.coverage_start,
      coverage_end: policyForm.coverage_end,
      policy_type: policyForm.policy_type,
    }, { onSuccess: () => setShowPolicyForm(false) });
  };

  const handleCreateClaim = () => {
    createClaim.mutate({
      policy_id: claimForm.policy_id,
      farmer_id: claimForm.farmer_id,
      event_type: claimForm.event_type,
      event_date: claimForm.event_date,
      description: claimForm.description || null,
      affected_area_ha: claimForm.affected_area_ha ? parseFloat(claimForm.affected_area_ha) : null,
      estimated_loss_aoa: claimForm.estimated_loss_aoa ? parseFloat(claimForm.estimated_loss_aoa) : 0,
    }, { onSuccess: () => setShowClaimForm(false) });
  };

  const handleCreateRule = () => {
    createRule.mutate({
      rule_name: ruleForm.rule_name,
      rule_type: ruleForm.rule_type,
      parameter: ruleForm.parameter,
      operator: ruleForm.operator,
      threshold_value: parseFloat(ruleForm.threshold_value),
      payout_percentage: parseFloat(ruleForm.payout_percentage),
      crop: ruleForm.crop || null,
      description: ruleForm.description || null,
    }, { onSuccess: () => { setShowRuleForm(false); setRuleForm({ rule_name: '', rule_type: 'ndvi', parameter: 'ndvi_value', operator: '<', threshold_value: '', payout_percentage: '100', crop: '', description: '' }); } });
  };

  return (
    <MainLayout title="Seguros Agrícolas" subtitle="Apólices paramétricas, sinistros e regras de compensação automática">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Apólices Activas</p><p className="text-2xl font-bold">{stats.activePolicies}</p><p className="text-xs text-muted-foreground">{stats.totalPolicies} total</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Valor Segurado</p><p className="text-2xl font-bold">{formatCurrency(stats.totalInsuredAoa)}</p><p className="text-xs text-muted-foreground">Prémios: {formatCurrency(stats.totalPremiumAoa)}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Sinistros Pendentes</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingClaims}</p><p className="text-xs text-muted-foreground">{stats.totalClaims} total</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Regras Paramétricas</p><p className="text-2xl font-bold">{stats.activeRules}</p><p className="text-xs text-muted-foreground">Compensado: {formatCurrency(stats.totalApprovedAoa)}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="policies">
          <TabsList>
            <TabsTrigger value="policies" className="gap-2"><Shield className="h-4 w-4" />Apólices</TabsTrigger>
            <TabsTrigger value="claims" className="gap-2"><AlertTriangle className="h-4 w-4" />Sinistros</TabsTrigger>
            <TabsTrigger value="rules" className="gap-2"><Settings className="h-4 w-4" />Regras Paramétricas</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar apólices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button onClick={() => setShowPolicyForm(true)}><Plus className="h-4 w-4 mr-2" />Nova Apólice</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Apólice</TableHead>
                      <TableHead>Agricultor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cultura</TableHead>
                      <TableHead className="text-right">Área (ha)</TableHead>
                      <TableHead className="text-right">Valor Segurado</TableHead>
                      <TableHead>Cobertura</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policiesLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                    ) : policies.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma apólice</TableCell></TableRow>
                    ) : policies.filter((p: any) => !search || p.policy_number?.toLowerCase().includes(search.toLowerCase()) || (p.farmers as any)?.name?.toLowerCase().includes(search.toLowerCase())).map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.policy_number}</TableCell>
                        <TableCell><div><p className="font-medium">{(p.farmers as any)?.name}</p><p className="text-xs text-muted-foreground">{(p.farmers as any)?.registration_number}</p></div></TableCell>
                        <TableCell><Badge variant="outline">{p.policy_type === 'parametric' ? 'Paramétrica' : 'Convencional'}</Badge></TableCell>
                        <TableCell>{p.crop}</TableCell>
                        <TableCell className="text-right font-mono">{Number(p.area_ha).toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(Number(p.sum_insured_aoa))}</TableCell>
                        <TableCell className="text-xs">{format(new Date(p.coverage_start), 'dd/MM/yy')} — {format(new Date(p.coverage_end), 'dd/MM/yy')}</TableCell>
                        <TableCell><Badge className={policyStatusColors[p.status]}>{policyStatusLabels[p.status] || p.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowClaimForm(true)}><Plus className="h-4 w-4 mr-2" />Registar Sinistro</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Sinistro</TableHead>
                      <TableHead>Agricultor</TableHead>
                      <TableHead>Apólice</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Perda Est.</TableHead>
                      <TableHead className="text-right">Aprovado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claimsLoading ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                    ) : claims.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum sinistro</TableCell></TableRow>
                    ) : claims.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.claim_number}</TableCell>
                        <TableCell className="font-medium">{(c.farmers as any)?.name}</TableCell>
                        <TableCell className="font-mono text-xs">{(c.insurance_policies as any)?.policy_number}</TableCell>
                        <TableCell><Badge variant="outline">{eventTypes.find(e => e.value === c.event_type)?.label || c.event_type}</Badge></TableCell>
                        <TableCell className="text-sm">{format(new Date(c.event_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(Number(c.estimated_loss_aoa))}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(Number(c.approved_amount_aoa))}</TableCell>
                        <TableCell><Badge className={claimStatusColors[c.status]}>{claimStatusLabels[c.status] || c.status}</Badge></TableCell>
                        <TableCell>
                          {c.status === 'submitted' && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateClaim.mutate({ id: c.id, status: 'approved', approved_amount_aoa: Number(c.estimated_loss_aoa), reviewed_at: new Date().toISOString() })}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateClaim.mutate({ id: c.id, status: 'rejected', reviewed_at: new Date().toISOString() })}><XCircle className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          )}
                          {c.status === 'approved' && (
                            <Button size="sm" variant="outline" onClick={() => updateClaim.mutate({ id: c.id, status: 'paid', paid_at: new Date().toISOString() })}>Marcar Pago</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parametric Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowRuleForm(true)}><Plus className="h-4 w-4 mr-2" />Nova Regra</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Parâmetro</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Compensação</TableHead>
                      <TableHead>Cultura</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rulesLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                    ) : rules.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma regra</TableCell></TableRow>
                    ) : rules.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.rule_name}</TableCell>
                        <TableCell><Badge variant="outline">{r.rule_type === 'ndvi' ? 'NDVI' : r.rule_type === 'rainfall' ? 'Precipitação' : r.rule_type === 'temperature' ? 'Temperatura' : r.rule_type}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">{r.parameter}</TableCell>
                        <TableCell className="font-mono text-sm">{r.operator} {Number(r.threshold_value)}</TableCell>
                        <TableCell className="font-mono">{Number(r.payout_percentage)}%</TableCell>
                        <TableCell>{r.crop || '—'}</TableCell>
                        <TableCell>
                          <Badge className={r.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} onClick={() => updateRule.mutate({ id: r.id, is_active: !r.is_active })} style={{ cursor: 'pointer' }}>
                            {r.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteRule.mutate(r.id)}><XCircle className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Policy Dialog */}
      <Dialog open={showPolicyForm} onOpenChange={setShowPolicyForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Apólice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>ID Agricultor *</Label><Input value={policyForm.farmer_id} onChange={e => setPolicyForm(f => ({ ...f, farmer_id: e.target.value }))} placeholder="UUID do agricultor" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cultura *</Label><Input value={policyForm.crop} onChange={e => setPolicyForm(f => ({ ...f, crop: e.target.value }))} /></div>
              <div><Label>Área (ha) *</Label><Input type="number" value={policyForm.area_ha} onChange={e => setPolicyForm(f => ({ ...f, area_ha: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Valor Segurado (AOA) *</Label><Input type="number" value={policyForm.sum_insured_aoa} onChange={e => setPolicyForm(f => ({ ...f, sum_insured_aoa: e.target.value }))} /></div>
              <div><Label>Prémio (AOA) *</Label><Input type="number" value={policyForm.premium_aoa} onChange={e => setPolicyForm(f => ({ ...f, premium_aoa: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Início Cobertura *</Label><Input type="date" value={policyForm.coverage_start} onChange={e => setPolicyForm(f => ({ ...f, coverage_start: e.target.value }))} /></div>
              <div><Label>Fim Cobertura *</Label><Input type="date" value={policyForm.coverage_end} onChange={e => setPolicyForm(f => ({ ...f, coverage_end: e.target.value }))} /></div>
            </div>
            <div><Label>Tipo</Label>
              <Select value={policyForm.policy_type} onValueChange={v => setPolicyForm(f => ({ ...f, policy_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="parametric">Paramétrica</SelectItem>
                  <SelectItem value="conventional">Convencional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPolicyForm(false)}>Cancelar</Button>
            <Button onClick={handleCreatePolicy} disabled={!policyForm.farmer_id || !policyForm.crop || !policyForm.area_ha || createPolicy.isPending}>{createPolicy.isPending ? 'A criar...' : 'Criar Apólice'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Claim Dialog */}
      <Dialog open={showClaimForm} onOpenChange={setShowClaimForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registar Sinistro</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Apólice *</Label>
              <Select value={claimForm.policy_id} onValueChange={v => {
                const pol = policies.find((p: any) => p.id === v);
                setClaimForm(f => ({ ...f, policy_id: v, farmer_id: pol?.farmer_id || '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar apólice" /></SelectTrigger>
                <SelectContent>{policies.filter((p: any) => p.status === 'active').map((p: any) => <SelectItem key={p.id} value={p.id}>{p.policy_number} — {(p.farmers as any)?.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo de Evento *</Label>
                <Select value={claimForm.event_type} onValueChange={v => setClaimForm(f => ({ ...f, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{eventTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data do Evento *</Label><Input type="date" value={claimForm.event_date} onChange={e => setClaimForm(f => ({ ...f, event_date: e.target.value }))} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={claimForm.description} onChange={e => setClaimForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Área Afectada (ha)</Label><Input type="number" value={claimForm.affected_area_ha} onChange={e => setClaimForm(f => ({ ...f, affected_area_ha: e.target.value }))} /></div>
              <div><Label>Perda Estimada (AOA)</Label><Input type="number" value={claimForm.estimated_loss_aoa} onChange={e => setClaimForm(f => ({ ...f, estimated_loss_aoa: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClaimForm(false)}>Cancelar</Button>
            <Button onClick={handleCreateClaim} disabled={!claimForm.policy_id || !claimForm.event_date || createClaim.isPending}>{createClaim.isPending ? 'A registar...' : 'Registar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Rule Dialog */}
      <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Regra Paramétrica</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome da Regra *</Label><Input value={ruleForm.rule_name} onChange={e => setRuleForm(f => ({ ...f, rule_name: e.target.value }))} placeholder="Ex: Seca severa - NDVI baixo" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label>
                <Select value={ruleForm.rule_type} onValueChange={v => setRuleForm(f => ({ ...f, rule_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ndvi">NDVI</SelectItem>
                    <SelectItem value="rainfall">Precipitação</SelectItem>
                    <SelectItem value="temperature">Temperatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Parâmetro</Label><Input value={ruleForm.parameter} onChange={e => setRuleForm(f => ({ ...f, parameter: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Operador</Label>
                <Select value={ruleForm.operator} onValueChange={v => setRuleForm(f => ({ ...f, operator: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<">{'<'}</SelectItem>
                    <SelectItem value="<=">{'≤'}</SelectItem>
                    <SelectItem value=">">{'>'}</SelectItem>
                    <SelectItem value=">=">{'≥'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Limiar *</Label><Input type="number" step="0.01" value={ruleForm.threshold_value} onChange={e => setRuleForm(f => ({ ...f, threshold_value: e.target.value }))} /></div>
              <div><Label>Compensação %</Label><Input type="number" value={ruleForm.payout_percentage} onChange={e => setRuleForm(f => ({ ...f, payout_percentage: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cultura (opcional)</Label><Input value={ruleForm.crop} onChange={e => setRuleForm(f => ({ ...f, crop: e.target.value }))} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={ruleForm.description} onChange={e => setRuleForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleForm(false)}>Cancelar</Button>
            <Button onClick={handleCreateRule} disabled={!ruleForm.rule_name || !ruleForm.threshold_value || createRule.isPending}>{createRule.isPending ? 'A criar...' : 'Criar Regra'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
