import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  Send, 
  Users, 
  Loader2, 
  CheckCircle, 
  Clock,
  BarChart3,
  List,
  Settings,
  FileText,
  MessageSquare,
  AlertTriangle,
  Phone,
  Mail,
  Smartphone,
  Plus,
  Search,
  Filter,
  XCircle,
  RefreshCw,
  Megaphone,
  Target,
  TrendingUp
} from 'lucide-react';
import { useOccurrences, useOccurrenceAlerts, useSendAlert } from '@/hooks/useOccurrences';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Sample contacts for demo
const sampleContacts = [
  { id: '1', phone: '+244 923 111 222', name: 'João Silva', province: 'Huambo', type: 'farmer' },
  { id: '2', phone: '+244 923 333 444', name: 'Maria Santos', province: 'Huambo', type: 'farmer' },
  { id: '3', phone: '+244 923 555 666', name: 'António Costa', province: 'Huíla', type: 'farmer' },
  { id: '4', phone: '+244 923 777 888', name: 'Ana Ferreira', province: 'Benguela', type: 'technician' },
  { id: '5', phone: '+244 923 999 000', name: 'Pedro Nunes', province: 'Malanje', type: 'farmer' },
  { id: '6', phone: '+244 924 111 333', name: 'Carlos Mendes', province: 'Huambo', type: 'cooperative' },
  { id: '7', phone: '+244 924 222 444', name: 'Luísa Gomes', province: 'Bié', type: 'farmer' },
  { id: '8', phone: '+244 924 333 555', name: 'Manuel Sousa', province: 'Huíla', type: 'technician' },
];

// Alert templates
const alertTemplates = [
  { id: '1', name: 'Alerta de Seca', message: 'ALERTA SIGAFLO: Condições de seca detectadas na sua região. Recomendamos irrigação controlada e proteção das culturas.' },
  { id: '2', name: 'Alerta de Inundação', message: 'ALERTA SIGAFLO: Risco de inundação na sua área. Proteja equipamentos e animais. Evite áreas baixas.' },
  { id: '3', name: 'Alerta de Praga', message: 'ALERTA SIGAFLO: Praga detectada na região. Inspeccione suas culturas e aplique tratamento preventivo.' },
  { id: '4', name: 'Alerta Geral', message: 'ALERTA SIGAFLO: Ocorrência registada na sua região. Mantenha-se informado e tome precauções.' },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function OccurrenceAlertsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');

  const { data: occurrences, isLoading: loadingOccurrences } = useOccurrences();
  const { data: alerts, isLoading: loadingAlerts } = useOccurrenceAlerts();
  const sendAlert = useSendAlert();

  // Demo data for sent alerts (since no real alerts exist yet)
  const demoAlerts = [
    { id: '1', occurrence_id: '1', message: 'Alerta de seca em Huambo', recipient_phone: '+244 923 111 222', status: 'delivered', sent_at: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: '2', occurrence_id: '1', message: 'Alerta de seca em Huambo', recipient_phone: '+244 923 333 444', status: 'delivered', sent_at: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: '3', occurrence_id: '2', message: 'Alerta de inundação em Benguela', recipient_phone: '+244 923 555 666', status: 'pending', sent_at: null, created_at: new Date().toISOString() },
  ];

  const allAlerts = alerts && alerts.length > 0 ? alerts : demoAlerts;

  // KPIs
  const totalAlertsSent = allAlerts.length;
  const deliveredAlerts = allAlerts.filter(a => a.status === 'delivered').length;
  const pendingAlerts = allAlerts.filter(a => a.status === 'pending').length;
  const failedAlerts = allAlerts.filter(a => a.status === 'failed').length;
  const deliveryRate = totalAlertsSent > 0 ? Math.round((deliveredAlerts / totalAlertsSent) * 100) : 0;

  // Filter contacts
  const filteredContacts = sampleContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    const matchesProvince = provinceFilter === 'all' || contact.province === provinceFilter;
    return matchesSearch && matchesProvince;
  });

  const provinces = [...new Set(sampleContacts.map(c => c.province))];

  const handleTogglePhone = (phone: string) => {
    setSelectedPhones((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    );
  };

  const handleSelectAll = () => {
    const phonesToSelect = filteredContacts.map(c => c.phone);
    if (selectedPhones.length === phonesToSelect.length) {
      setSelectedPhones([]);
    } else {
      setSelectedPhones(phonesToSelect);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = alertTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.message);
    }
  };

  const handleSendAlerts = async () => {
    if (!selectedOccurrence || selectedPhones.length === 0 || !customMessage) return;

    try {
      await sendAlert.mutateAsync({
        occurrence_id: selectedOccurrence,
        phones: selectedPhones,
        message: customMessage,
      });

      setSelectedPhones([]);
      setCustomMessage('');
      setSelectedOccurrence('');
      setSelectedTemplate('');
    } catch (error) {
      console.error('Error sending alerts:', error);
    }
  };

  // Chart data
  const statusDistribution = [
    { name: 'Entregues', value: deliveredAlerts },
    { name: 'Pendentes', value: pendingAlerts },
    { name: 'Falhados', value: failedAlerts },
  ].filter(d => d.value > 0);

  const isLoading = loadingOccurrences || loadingAlerts;

  if (isLoading) {
    return (
      <MainLayout title="Gestão de Alertas" subtitle="Sistema de alertas SMS">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestão de Alertas" subtitle="Sistema de alertas SMS para ocorrências">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" />
              Gestão de Alertas
            </h1>
            <p className="text-muted-foreground">
              Envie alertas SMS para agricultores sobre ocorrências
            </p>
          </div>
          <Button onClick={() => setActiveTab('send')}>
            <Send className="h-4 w-4 mr-2" />
            Novo Alerta
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAlertsSent}</div>
                  <p className="text-xs text-muted-foreground">
                    Alertas SMS enviados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deliveryRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {deliveredAlerts} de {totalAlertsSent} entregues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando envio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contactos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sampleContacts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Agricultores registados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Estado dos Alertas</CardTitle>
                  <CardDescription>Distribuição por estado de entrega</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas Recentes</CardTitle>
                  <CardDescription>Últimos alertas enviados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allAlerts.slice(0, 5).map((alert, index) => (
                      <div key={alert.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.status === 'delivered' ? 'bg-green-500/10' :
                            alert.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                          }`}>
                            {alert.status === 'delivered' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : alert.status === 'pending' ? (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {alert.message?.slice(0, 40)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {alert.recipient_phone}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          alert.status === 'delivered' ? 'default' :
                          alert.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {alert.status === 'delivered' ? 'Entregue' :
                           alert.status === 'pending' ? 'Pendente' : 'Falhou'}
                        </Badge>
                      </div>
                    ))}
                    {allAlerts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum alerta enviado ainda
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Cobertura por Província</CardTitle>
                <CardDescription>Contactos disponíveis por região</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {provinces.map(province => {
                    const count = sampleContacts.filter(c => c.province === province).length;
                    return (
                      <div key={province} className="p-4 border rounded-lg text-center">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">{province}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left: Compose Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Compor Alerta
                  </CardTitle>
                  <CardDescription>
                    Configure e envie alertas SMS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Occurrence Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ocorrência Relacionada</label>
                    <Select value={selectedOccurrence} onValueChange={setSelectedOccurrence}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ocorrência" />
                      </SelectTrigger>
                      <SelectContent>
                        {occurrences?.map((occurrence) => (
                          <SelectItem key={occurrence.id} value={occurrence.id}>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={occurrence.severity === 'critical' || occurrence.severity === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {occurrence.severity}
                              </Badge>
                              <span className="truncate max-w-[200px]">{occurrence.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template (Opcional)</label>
                    <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um template" />
                      </SelectTrigger>
                      <SelectContent>
                        {alertTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensagem</label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Escreva a mensagem de alerta..."
                      className="min-h-32"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{customMessage.length}/160 caracteres</span>
                      <span>{Math.ceil(customMessage.length / 160)} SMS</span>
                    </div>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendAlerts}
                    disabled={!selectedOccurrence || selectedPhones.length === 0 || !customMessage || sendAlert.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {sendAlert.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar para {selectedPhones.length} destinatário(s)
                  </Button>
                </CardContent>
              </Card>

              {/* Right: Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Destinatários
                  </CardTitle>
                  <CardDescription>
                    Selecione os contactos para receber o alerta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Província" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select All */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedPhones.length} de {filteredContacts.length} seleccionados
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                      {selectedPhones.length === filteredContacts.length ? 'Desmarcar' : 'Seleccionar'} todos
                    </Button>
                  </div>

                  {/* Contacts List */}
                  <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${
                          selectedPhones.includes(contact.phone) ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleTogglePhone(contact.phone)}
                      >
                        <Checkbox
                          checked={selectedPhones.includes(contact.phone)}
                          onCheckedChange={() => handleTogglePhone(contact.phone)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{contact.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {contact.province}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {contact.type === 'farmer' ? 'Agricultor' :
                             contact.type === 'technician' ? 'Técnico' : 'Cooperativa'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Alertas</CardTitle>
                <CardDescription>
                  {allAlerts.length} alertas enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Enviado em</TableHead>
                      <TableHead>Entregue em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAlerts.map((alert, index) => (
                      <TableRow key={alert.id || index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {alert.recipient_phone}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {alert.message}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            alert.status === 'delivered' ? 'default' :
                            alert.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {alert.status === 'delivered' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {alert.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {alert.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {alert.status === 'delivered' ? 'Entregue' :
                             alert.status === 'pending' ? 'Pendente' : 'Falhou'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {alert.created_at ? format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: pt }) : '-'}
                        </TableCell>
                        <TableCell>
                          {alert.sent_at ? format(new Date(alert.sent_at), 'dd/MM/yyyy HH:mm', { locale: pt }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {allAlerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum alerta enviado ainda
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Templates de Alerta</CardTitle>
                  <CardDescription>Mensagens pré-definidas para envio rápido</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertTemplates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{template.name}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSelectTemplate(template.id);
                            setActiveTab('send');
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Usar
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.message.length} caracteres • {Math.ceil(template.message.length / 160)} SMS
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Template</CardTitle>
                  <CardDescription>Adicione templates personalizados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Template</label>
                    <Input placeholder="Ex: Alerta de Geada" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensagem</label>
                    <Textarea 
                      placeholder="Escreva a mensagem padrão..."
                      className="min-h-32"
                    />
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Guardar Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
