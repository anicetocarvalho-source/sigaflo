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
import { AlertTriangle, Bell, MessageSquare, Send, Plus, Search, MapPin, Phone } from 'lucide-react';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const severityLabels: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  investigating: 'Em Investigação',
  responding: 'Em Resposta',
  resolved: 'Resolvido',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  investigating: 'bg-blue-100 text-blue-800',
  responding: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
};

const alertTypes = [
  { value: 'climate', label: 'Climático' },
  { value: 'phytosanitary', label: 'Fitossanitário' },
  { value: 'market', label: 'Mercado' },
  { value: 'security', label: 'Segurança' },
  { value: 'other', label: 'Outro' },
];

export default function AlertsPage() {
  const { alerts, alertsLoading, alertStats, createAlert, updateAlert, smsReceived, smsReceivedLoading, smsSent, sendSms } = useMonitoring();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [interpretingId, setInterpretingId] = useState<string | null>(null);
  const [smsForm, setSmsForm] = useState({ recipient_phone: '', message_text: '', target_zone: '' });
  const [showSmsForm, setShowSmsForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', alert_type: 'climate', severity: 'medium',
    province_id: '', municipality_id: '', latitude: '', longitude: '',
  });

  const { provinces, municipalities } = useLocationCascade({ initialProvinceId: form.province_id });

  const filteredAlerts = alerts.filter((a: any) =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.alert_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    createAlert.mutate({
      title: form.title,
      description: form.description || null,
      alert_type: form.alert_type,
      severity: form.severity,
      province_id: form.province_id || null,
      municipality_id: form.municipality_id || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    }, { onSuccess: () => { setShowForm(false); setForm({ title: '', description: '', alert_type: 'climate', severity: 'medium', province_id: '', municipality_id: '', latitude: '', longitude: '' }); } });
  };

  const handleInterpretSms = async (smsId: string, rawMessage: string) => {
    setInterpretingId(smsId);
    try {
      const { data, error } = await supabase.functions.invoke('interpret-sms', {
        body: { message: rawMessage },
      });
      if (error) throw error;
      const interpretation = data?.interpretation || 'Sem interpretação disponível';
      await supabase.from('sms_received').update({
        ai_interpretation: interpretation,
        processed: true,
        processed_at: new Date().toISOString(),
      } as any).eq('id', smsId);
      toast.success('SMS interpretado com sucesso');
    } catch {
      toast.error('Erro ao interpretar SMS');
    } finally {
      setInterpretingId(null);
    }
  };

  const handleSendSms = () => {
    sendSms.mutate({
      recipient_phone: smsForm.recipient_phone,
      message_text: smsForm.message_text,
      target_zone: smsForm.target_zone || null,
    }, { onSuccess: () => { setShowSmsForm(false); setSmsForm({ recipient_phone: '', message_text: '', target_zone: '' }); } });
  };

  return (
    <MainLayout title="Alertas & Monitoria" subtitle="Gestão de alertas, SMS e riscos">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Alertas</p><p className="text-2xl font-bold">{alertStats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{alertStats.pending}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Críticos</p><p className="text-2xl font-bold text-destructive">{alertStats.critical}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Resolvidos</p><p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="alerts">
          <TabsList>
            <TabsTrigger value="alerts" className="gap-2"><Bell className="h-4 w-4" />Alertas</TabsTrigger>
            <TabsTrigger value="sms-received" className="gap-2"><MessageSquare className="h-4 w-4" />SMS Recebidos</TabsTrigger>
            <TabsTrigger value="sms-sent" className="gap-2"><Send className="h-4 w-4" />SMS Enviados</TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar alertas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Novo Alerta</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                    ) : filteredAlerts.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum alerta</TableCell></TableRow>
                    ) : filteredAlerts.map((alert: any) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-mono text-xs">{alert.alert_number}</TableCell>
                        <TableCell className="font-medium">{alert.title}</TableCell>
                        <TableCell><Badge variant="outline">{alertTypes.find(t => t.value === alert.alert_type)?.label || alert.alert_type}</Badge></TableCell>
                        <TableCell><Badge className={severityColors[alert.severity]}>{severityLabels[alert.severity]}</Badge></TableCell>
                        <TableCell><span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{(alert.provinces as any)?.name || '—'}</span></TableCell>
                        <TableCell><Badge className={statusColors[alert.response_status]}>{statusLabels[alert.response_status]}</Badge></TableCell>
                        <TableCell className="text-sm">{format(new Date(alert.created_at), 'dd/MM/yyyy', { locale: pt })}</TableCell>
                        <TableCell>
                          {alert.response_status !== 'resolved' && (
                            <Select
                              value={alert.response_status}
                              onValueChange={(v) => updateAlert.mutate({ id: alert.id, response_status: v, ...(v === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })}
                            >
                              <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="investigating">Investigar</SelectItem>
                                <SelectItem value="responding">Responder</SelectItem>
                                <SelectItem value="resolved">Resolvido</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Received Tab */}
          <TabsContent value="sms-received" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>SMS Recebidos — Interpretação IA</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Interpretação IA</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smsReceivedLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                    ) : smsReceived.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum SMS recebido</TableCell></TableRow>
                    ) : smsReceived.map((sms: any) => (
                      <TableRow key={sms.id}>
                        <TableCell className="flex items-center gap-1"><Phone className="h-3 w-3" />{sms.sender_phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{sms.raw_message}</TableCell>
                        <TableCell className="max-w-xs">
                          {sms.ai_interpretation ? (
                            <p className="text-sm text-green-700">{sms.ai_interpretation}</p>
                          ) : (
                            <Badge variant="outline">Não processado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{format(new Date(sms.received_at), 'dd/MM HH:mm')}</TableCell>
                        <TableCell>
                          {!sms.processed && (
                            <Button size="sm" variant="outline" disabled={interpretingId === sms.id} onClick={() => handleInterpretSms(sms.id, sms.raw_message)}>
                              {interpretingId === sms.id ? 'A interpretar...' : 'Interpretar IA'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Sent Tab */}
          <TabsContent value="sms-sent" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowSmsForm(true)}><Send className="h-4 w-4 mr-2" />Enviar SMS</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Zona</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smsSent.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum SMS enviado</TableCell></TableRow>
                    ) : smsSent.map((sms: any) => (
                      <TableRow key={sms.id}>
                        <TableCell>{sms.recipient_phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{sms.message_text}</TableCell>
                        <TableCell>{sms.target_zone || '—'}</TableCell>
                        <TableCell><Badge variant="outline">{sms.delivery_status}</Badge></TableCell>
                        <TableCell className="text-sm">{format(new Date(sms.sent_at), 'dd/MM HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Alerta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label>
                <Select value={form.alert_type} onValueChange={v => setForm(f => ({ ...f, alert_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{alertTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Severidade</Label>
                <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Província</Label>
                <Select value={form.province_id} onValueChange={v => setForm(f => ({ ...f, province_id: v, municipality_id: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{provinces.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Município</Label>
                <Select value={form.municipality_id} onValueChange={v => setForm(f => ({ ...f, municipality_id: v }))} disabled={!form.province_id}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{municipalities.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.title || createAlert.isPending}>{createAlert.isPending ? 'A criar...' : 'Criar Alerta'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send SMS Dialog */}
      <Dialog open={showSmsForm} onOpenChange={setShowSmsForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enviar SMS</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Destinatário *</Label><Input value={smsForm.recipient_phone} onChange={e => setSmsForm(f => ({ ...f, recipient_phone: e.target.value }))} placeholder="+244 9XX XXX XXX" /></div>
            <div><Label>Zona/Região</Label><Input value={smsForm.target_zone} onChange={e => setSmsForm(f => ({ ...f, target_zone: e.target.value }))} /></div>
            <div><Label>Mensagem *</Label><Textarea value={smsForm.message_text} onChange={e => setSmsForm(f => ({ ...f, message_text: e.target.value }))} rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSmsForm(false)}>Cancelar</Button>
            <Button onClick={handleSendSms} disabled={!smsForm.recipient_phone || !smsForm.message_text || sendSms.isPending}>{sendSms.isPending ? 'A enviar...' : 'Enviar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
