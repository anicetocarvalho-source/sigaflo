import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, FileText, AlertTriangle, Settings, Plus, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import {
  useInsurancePolicies, useInsuranceQuotes, useInsuranceClaims, useParametricRules,
  useCreateQuote, useCreatePolicy, useCreateClaim, useUpdateClaimStatus, useCreateParametricRule,
  useInsuranceStats
} from '@/hooks/useInsurance';
import { useFarmers } from '@/hooks/useFarmers';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  active: 'Activa', expired: 'Expirada', cancelled: 'Cancelada',
  pending: 'Pendente', under_review: 'Em Análise', approved: 'Aprovado',
  rejected: 'Rejeitado', paid: 'Pago', accepted: 'Aceite', draft: 'Rascunho',
};

export default function InsurancePage() {
  const { data: policies, isLoading: policiesLoading } = useInsurancePolicies();
  const { data: quotes, isLoading: quotesLoading } = useInsuranceQuotes();
  const { data: claims, isLoading: claimsLoading } = useInsuranceClaims();
  const { data: rules, isLoading: rulesLoading } = useParametricRules();
  const { data: farmers } = useFarmers();
  const stats = useInsuranceStats();
  const createQuote = useCreateQuote();
  const createPolicy = useCreatePolicy();
  const createClaim = useCreateClaim();
  const updateClaimStatus = useUpdateClaimStatus();
  const createRule = useCreateParametricRule();

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);

  const [quoteForm, setQuoteForm] = useState({ farmer_id: '', crop: '', area_ha: '', premium_aoa: '', insured_value_aoa: '', policy_type: 'parametric' });
  const [claimForm, setClaimForm] = useState({ policy_id: '', event_type: '', event_date: '', description: '', estimated_loss_aoa: '' });
  const [ruleForm, setRuleForm] = useState({ rule_name: '', parameter_type: 'ndvi', threshold_value: '', trigger_condition: 'below', payout_percentage: '', crop: '' });

  const handleCreateQuote = () => {
    createQuote.mutate({
      farmer_id: quoteForm.farmer_id,
      crop: quoteForm.crop,
      area_ha: parseFloat(quoteForm.area_ha),
      premium_aoa: parseFloat(quoteForm.premium_aoa),
      insured_value_aoa: parseFloat(quoteForm.insured_value_aoa),
      policy_type: quoteForm.policy_type,
      status: 'pending',
    }, { onSuccess: () => { setShowQuoteForm(false); setQuoteForm({ farmer_id: '', crop: '', area_ha: '', premium_aoa: '', insured_value_aoa: '', policy_type: 'parametric' }); } });
  };

  const handleCreateClaim = () => {
    createClaim.mutate({
      policy_id: claimForm.policy_id,
      event_type: claimForm.event_type,
      event_date: claimForm.event_date,
      description: claimForm.description,
      estimated_loss_aoa: parseFloat(claimForm.estimated_loss_aoa),
      status: 'pending',
    }, { onSuccess: () => { setShowClaimForm(false); setClaimForm({ policy_id: '', event_type: '', event_date: '', description: '', estimated_loss_aoa: '' }); } });
  };

  const handleCreateRule = () => {
    createRule.mutate({
      rule_name: ruleForm.rule_name,
      parameter_type: ruleForm.parameter_type,
      threshold_value: parseFloat(ruleForm.threshold_value),
      trigger_condition: ruleForm.trigger_condition,
      payout_percentage: parseFloat(ruleForm.payout_percentage),
      crop: ruleForm.crop,
      is_active: true,
    }, { onSuccess: () => { setShowRuleForm(false); setRuleForm({ rule_name: '', parameter_type: 'ndvi', threshold_value: '', trigger_condition: 'below', payout_percentage: '', crop: '' }); } });
  };

  return (
    <MainLayout title="Seguros Agrícolas" subtitle="Gestão de apólices, sinistros e regras paramétricas">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Apólices Activas</p><p className="text-2xl font-bold">{stats.activePolicies}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Valor Segurado</p><p className="text-2xl font-bold">{(stats.totalInsuredValue / 1e6).toFixed(1)}M</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Sinistros Pendentes</p><p className="text-2xl font-bold text-orange-600">{stats.pendingClaims}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Indemnizações</p><p className="text-2xl font-bold">{(stats.totalClaimsPaid / 1e6).toFixed(1)}M</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Cotações Pendentes</p><p className="text-2xl font-bold">{stats.pendingQuotes}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="policies">
          <TabsList>
            <TabsTrigger value="policies"><Shield className="h-4 w-4 mr-1" />Apólices</TabsTrigger>
            <TabsTrigger value="quotes"><FileText className="h-4 w-4 mr-1" />Cotações</TabsTrigger>
            <TabsTrigger value="claims"><AlertTriangle className="h-4 w-4 mr-1" />Sinistros</TabsTrigger>
            <TabsTrigger value="rules"><Settings className="h-4 w-4 mr-1" />Regras Paramétricas</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader><CardTitle>Apólices de Seguro</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Apólice</TableHead>
                      <TableHead>Agricultor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cultura</TableHead>
                      <TableHead>Valor Segurado</TableHead>
                      <TableHead>Prémio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policiesLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">A carregar...</TableCell></TableRow>
                    ) : !policies?.length ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem apólices registadas</TableCell></TableRow>
                    ) : policies.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.policy_number}</TableCell>
                        <TableCell>{(p.farmers as any)?.name || '—'}</TableCell>
                        <TableCell><Badge variant="outline">{p.policy_type === 'parametric' ? 'Paramétrica' : 'Convencional'}</Badge></TableCell>
                        <TableCell>{p.crop || '—'}</TableCell>
                        <TableCell>{(p.insured_value_aoa || 0).toLocaleString()} AOA</TableCell>
                        <TableCell>{(p.premium_aoa || 0).toLocaleString()} AOA</TableCell>
                        <TableCell><Badge className={statusColors[p.status] || ''}>{statusLabels[p.status] || p.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cotações</CardTitle>
                <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Cotação</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nova Cotação de Seguro</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Agricultor</Label>
                        <Select value={quoteForm.farmer_id} onValueChange={v => setQuoteForm(p => ({...p, farmer_id: v}))}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>{farmers?.slice(0, 50).map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Cultura</Label><Input value={quoteForm.crop} onChange={e => setQuoteForm(p => ({...p, crop: e.target.value}))} placeholder="Ex: Milho" /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Área (ha)</Label><Input type="number" value={quoteForm.area_ha} onChange={e => setQuoteForm(p => ({...p, area_ha: e.target.value}))} /></div>
                        <div><Label>Tipo</Label>
                          <Select value={quoteForm.policy_type} onValueChange={v => setQuoteForm(p => ({...p, policy_type: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="parametric">Paramétrica</SelectItem><SelectItem value="conventional">Convencional</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Prémio (AOA)</Label><Input type="number" value={quoteForm.premium_aoa} onChange={e => setQuoteForm(p => ({...p, premium_aoa: e.target.value}))} /></div>
                        <div><Label>Valor Segurado (AOA)</Label><Input type="number" value={quoteForm.insured_value_aoa} onChange={e => setQuoteForm(p => ({...p, insured_value_aoa: e.target.value}))} /></div>
                      </div>
                      <Button onClick={handleCreateQuote} disabled={createQuote.isPending} className="w-full">Criar Cotação</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Cotação</TableHead>
                      <TableHead>Agricultor</TableHead>
                      <TableHead>Cultura</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Prémio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotesLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8">A carregar...</TableCell></TableRow>
                    ) : !quotes?.length ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem cotações</TableCell></TableRow>
                    ) : quotes.map((q: any) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-mono text-xs">{q.quote_number}</TableCell>
                        <TableCell>{(q.farmers as any)?.name || '—'}</TableCell>
                        <TableCell>{q.crop || '—'}</TableCell>
                        <TableCell>{q.area_ha} ha</TableCell>
                        <TableCell>{(q.premium_aoa || 0).toLocaleString()} AOA</TableCell>
                        <TableCell><Badge className={statusColors[q.status] || ''}>{statusLabels[q.status] || q.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sinistros</CardTitle>
                <Dialog open={showClaimForm} onOpenChange={setShowClaimForm}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Registar Sinistro</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Registar Sinistro</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Apólice</Label>
                        <Select value={claimForm.policy_id} onValueChange={v => setClaimForm(p => ({...p, policy_id: v}))}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar apólice..." /></SelectTrigger>
                          <SelectContent>{policies?.filter((p: any) => p.status === 'active').map((p: any) => <SelectItem key={p.id} value={p.id}>{p.policy_number} — {(p.farmers as any)?.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Tipo de Evento</Label>
                        <Select value={claimForm.event_type} onValueChange={v => setClaimForm(p => ({...p, event_type: v}))}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="drought">Seca</SelectItem>
                            <SelectItem value="flood">Inundação</SelectItem>
                            <SelectItem value="pest">Praga</SelectItem>
                            <SelectItem value="storm">Tempestade</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Data do Evento</Label><Input type="date" value={claimForm.event_date} onChange={e => setClaimForm(p => ({...p, event_date: e.target.value}))} /></div>
                      <div><Label>Descrição</Label><Input value={claimForm.description} onChange={e => setClaimForm(p => ({...p, description: e.target.value}))} /></div>
                      <div><Label>Perda Estimada (AOA)</Label><Input type="number" value={claimForm.estimated_loss_aoa} onChange={e => setClaimForm(p => ({...p, estimated_loss_aoa: e.target.value}))} /></div>
                      <Button onClick={handleCreateClaim} disabled={createClaim.isPending} className="w-full">Registar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Sinistro</TableHead>
                      <TableHead>Apólice</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Perda Estimada</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claimsLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">A carregar...</TableCell></TableRow>
                    ) : !claims?.length ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem sinistros</TableCell></TableRow>
                    ) : claims.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.claim_number}</TableCell>
                        <TableCell className="font-mono text-xs">{(c.insurance_policies as any)?.policy_number || '—'}</TableCell>
                        <TableCell>{c.event_type}</TableCell>
                        <TableCell>{c.event_date ? new Date(c.event_date).toLocaleDateString('pt-AO') : '—'}</TableCell>
                        <TableCell>{(c.estimated_loss_aoa || 0).toLocaleString()} AOA</TableCell>
                        <TableCell><Badge className={statusColors[c.status] || ''}>{statusLabels[c.status] || c.status}</Badge></TableCell>
                        <TableCell>
                          {c.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => updateClaimStatus.mutate({ id: c.id, status: 'approved' })}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => updateClaimStatus.mutate({ id: c.id, status: 'rejected' })}><XCircle className="h-4 w-4 text-red-600" /></Button>
                            </div>
                          )}
                          {c.status === 'approved' && (
                            <Button size="sm" variant="ghost" onClick={() => updateClaimStatus.mutate({ id: c.id, status: 'paid', payment_amount_aoa: c.estimated_loss_aoa })}><DollarSign className="h-4 w-4 text-green-600" /></Button>
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
          <TabsContent value="rules">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Regras Paramétricas</CardTitle>
                <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Regra</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nova Regra Paramétrica</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Nome da Regra</Label><Input value={ruleForm.rule_name} onChange={e => setRuleForm(p => ({...p, rule_name: e.target.value}))} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Parâmetro</Label>
                          <Select value={ruleForm.parameter_type} onValueChange={v => setRuleForm(p => ({...p, parameter_type: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ndvi">NDVI</SelectItem>
                              <SelectItem value="precipitation">Precipitação</SelectItem>
                              <SelectItem value="temperature">Temperatura</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label>Condição</Label>
                          <Select value={ruleForm.trigger_condition} onValueChange={v => setRuleForm(p => ({...p, trigger_condition: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="below">Abaixo de</SelectItem>
                              <SelectItem value="above">Acima de</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Valor Limiar</Label><Input type="number" step="0.01" value={ruleForm.threshold_value} onChange={e => setRuleForm(p => ({...p, threshold_value: e.target.value}))} /></div>
                        <div><Label>% Indemnização</Label><Input type="number" value={ruleForm.payout_percentage} onChange={e => setRuleForm(p => ({...p, payout_percentage: e.target.value}))} /></div>
                      </div>
                      <div><Label>Cultura</Label><Input value={ruleForm.crop} onChange={e => setRuleForm(p => ({...p, crop: e.target.value}))} placeholder="Ex: Milho" /></div>
                      <Button onClick={handleCreateRule} disabled={createRule.isPending} className="w-full">Criar Regra</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Parâmetro</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Limiar</TableHead>
                      <TableHead>% Indemnização</TableHead>
                      <TableHead>Cultura</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rulesLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">A carregar...</TableCell></TableRow>
                    ) : !rules?.length ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem regras</TableCell></TableRow>
                    ) : rules.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.rule_name}</TableCell>
                        <TableCell><Badge variant="outline">{r.parameter_type?.toUpperCase()}</Badge></TableCell>
                        <TableCell>{r.trigger_condition === 'below' ? 'Abaixo de' : 'Acima de'}</TableCell>
                        <TableCell>{r.threshold_value}</TableCell>
                        <TableCell>{r.payout_percentage}%</TableCell>
                        <TableCell>{r.crop || '—'}</TableCell>
                        <TableCell><Badge className={r.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{r.is_active ? 'Activa' : 'Inactiva'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
