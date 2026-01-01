import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileCheck,
  CloudRain,
  TreePine,
  Coffee,
  Gift,
  Landmark,
  RefreshCw,
  Mail,
  Smartphone,
  Monitor,
  MoreVertical,
  Archive,
  Star,
  StarOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

// Notification types
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationCategory = 'system' | 'farmers' | 'certificates' | 'occurrences' | 'forestry' | 'coffee' | 'incentives' | 'credit';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  link?: string;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Novo agricultor registado',
    message: 'João Manuel da Silva foi registado na província de Huambo',
    type: 'success',
    category: 'farmers',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    starred: false,
    link: '/agricultores',
  },
  {
    id: '2',
    title: 'Certificado pendente de aprovação',
    message: '3 certificados aguardam validação na província de Benguela',
    type: 'warning',
    category: 'certificates',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    starred: true,
    link: '/certificados',
  },
  {
    id: '3',
    title: 'Alerta de seca detectado',
    message: 'Condições de seca moderada registadas no município de Bailundo',
    type: 'error',
    category: 'occurrences',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    starred: true,
    link: '/ocorrencias/climaticas',
  },
  {
    id: '4',
    title: 'Lote de café exportado',
    message: 'Lote CAFE-2025-0042 foi exportado com sucesso para Portugal',
    type: 'success',
    category: 'coffee',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    starred: false,
    link: '/cafe/lotes',
  },
  {
    id: '5',
    title: 'Manutenção programada',
    message: 'O sistema estará em manutenção no dia 05/01 das 02:00 às 04:00',
    type: 'info',
    category: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    read: true,
    starred: false,
  },
  {
    id: '6',
    title: 'Incentivo aprovado',
    message: 'Programa "Sementes Melhoradas 2025" aprovado para distribuição',
    type: 'success',
    category: 'incentives',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    starred: false,
    link: '/incentivos',
  },
  {
    id: '7',
    title: 'Licença florestal expirada',
    message: '2 licenças florestais expiraram e necessitam renovação',
    type: 'warning',
    category: 'forestry',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    starred: false,
    link: '/florestal/licenciamento',
  },
  {
    id: '8',
    title: 'Score de crédito actualizado',
    message: '15 agricultores tiveram seus scores de crédito recalculados',
    type: 'info',
    category: 'credit',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    starred: false,
    link: '/credito-seguro',
  },
  {
    id: '9',
    title: 'Cooperativa criada',
    message: 'Cooperativa Agrícola do Planalto foi registada com 25 membros',
    type: 'success',
    category: 'farmers',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    read: true,
    starred: false,
    link: '/agricultores/cooperativas',
  },
  {
    id: '10',
    title: 'Falha na sincronização',
    message: 'Erro ao sincronizar dados com o servidor central. Tentando novamente...',
    type: 'error',
    category: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    read: true,
    starred: false,
  },
];

// Category config
const categoryConfig: Record<NotificationCategory, { label: string; icon: typeof Bell; color: string }> = {
  system: { label: 'Sistema', icon: Monitor, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  farmers: { label: 'Agricultores', icon: Users, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  certificates: { label: 'Certificados', icon: FileCheck, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  occurrences: { label: 'Ocorrências', icon: CloudRain, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  forestry: { label: 'Florestal', icon: TreePine, color: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300' },
  coffee: { label: 'Café', icon: Coffee, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  incentives: { label: 'Incentivos', icon: Gift, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  credit: { label: 'Crédito', icon: Landmark, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
};

// Type config
const typeConfig: Record<NotificationType, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-blue-500' },
  success: { icon: CheckCircle2, color: 'text-green-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  error: { icon: XCircle, color: 'text-red-500' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
      if (selectedType !== 'all' && n.type !== selectedType) return false;
      if (showUnreadOnly && n.read) return false;
      return true;
    });
  }, [notifications, selectedCategory, selectedType, showUnreadOnly]);

  // Stats
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    starred: notifications.filter(n => n.starred).length,
    today: notifications.filter(n => {
      const today = new Date();
      return n.timestamp.toDateString() === today.toDateString();
    }).length,
  }), [notifications]);

  // Actions
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const toggleStar = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, starred: !n.starred } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notificação removida');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Todas as notificações marcadas como lidas');
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} notificações removidas`);
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => prev.map(n => 
      selectedIds.includes(n.id) ? { ...n, read: true } : n
    ));
    setSelectedIds([]);
    toast.success('Notificações marcadas como lidas');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const TypeIcon = typeConfig[notification.type].icon;
    const CategoryIcon = categoryConfig[notification.category].icon;
    
    return (
      <div
        className={`flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors hover:bg-muted/50 ${
          !notification.read ? 'bg-primary/5' : ''
        }`}
      >
        <Checkbox
          checked={selectedIds.includes(notification.id)}
          onCheckedChange={() => toggleSelect(notification.id)}
          className="mt-1"
        />
        
        <div className={`p-2 rounded-full ${categoryConfig[notification.category].color}`}>
          <CategoryIcon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <TypeIcon className={`h-4 w-4 ${typeConfig[notification.type].color}`} />
                <h4 className={`font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </h4>
                {!notification.read && (
                  <Badge variant="default" className="h-5 text-xs">Novo</Badge>
                )}
                {notification.starred && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  {categoryConfig[notification.category].label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: pt })}
                </span>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {notification.read ? (
                  <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Marcar como não lida
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como lida
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => toggleStar(notification.id)}>
                  {notification.starred ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Remover destaque
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Destacar
                    </>
                  )}
                </DropdownMenuItem>
                {notification.link && (
                  <DropdownMenuItem asChild>
                    <a href={notification.link}>
                      <Bell className="h-4 w-4 mr-2" />
                      Ver detalhes
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deleteNotification(notification.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout 
      title="Notificações" 
      subtitle="Centro de notificações e alertas do sistema"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">Não lidas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.starred}</p>
                <p className="text-sm text-muted-foreground">Destacadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">Hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              <Info className="h-4 w-4" />
              Não Lidas
              {stats.unread > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{stats.unread}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="starred" className="gap-2">
              <Star className="h-4 w-4" />
              Destacadas
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Preferências
            </TabsTrigger>
          </TabsList>

          {/* All / Unread / Starred Tabs */}
          {['all', 'unread', 'starred'].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Object.entries(categoryConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="info">Informação</SelectItem>
                          <SelectItem value="success">Sucesso</SelectItem>
                          <SelectItem value="warning">Aviso</SelectItem>
                          <SelectItem value="error">Erro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedIds.length > 0 && (
                        <>
                          <Button variant="outline" size="sm" onClick={markSelectedAsRead}>
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Marcar lidas ({selectedIds.length})
                          </Button>
                          <Button variant="outline" size="sm" onClick={deleteSelected} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar ({selectedIds.length})
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Marcar todas como lidas
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Select All */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
                    <Checkbox
                      checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onCheckedChange={selectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedIds.length > 0 
                        ? `${selectedIds.length} seleccionada(s)` 
                        : 'Seleccionar todas'}
                    </span>
                  </div>
                  
                  <ScrollArea className="h-[500px]">
                    {filteredNotifications
                      .filter(n => {
                        if (tabValue === 'unread') return !n.read;
                        if (tabValue === 'starred') return n.starred;
                        return true;
                      })
                      .length === 0 ? (
                      <div className="text-center py-12">
                        <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                        <p className="text-muted-foreground">
                          {tabValue === 'unread' 
                            ? 'Não há notificações não lidas' 
                            : tabValue === 'starred'
                            ? 'Não há notificações destacadas'
                            : 'Não há notificações para mostrar'}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications
                        .filter(n => {
                          if (tabValue === 'unread') return !n.read;
                          if (tabValue === 'starred') return n.starred;
                          return true;
                        })
                        .map(notification => (
                          <NotificationItem key={notification.id} notification={notification} />
                        ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Preferências de Notificação
                  </CardTitle>
                  <CardDescription>Configure como deseja receber notificações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Notificações no Sistema</Label>
                        <p className="text-sm text-muted-foreground">Receber alertas no navegador</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">Receber resumo diário por email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Notificações SMS</Label>
                        <p className="text-sm text-muted-foreground">Alertas críticos por SMS</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Categorias Activas
                  </CardTitle>
                  <CardDescription>Seleccione as categorias que deseja receber</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <config.icon className="h-4 w-4" />
                        </div>
                        <Label>{config.label}</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Prioridade de Alertas
                  </CardTitle>
                  <CardDescription>Defina o nível mínimo de alerta para cada canal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Sistema (Navegador)</Label>
                      <Select defaultValue="info">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Todos os níveis</SelectItem>
                          <SelectItem value="warning">Avisos e superiores</SelectItem>
                          <SelectItem value="error">Apenas erros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Select defaultValue="warning">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Todos os níveis</SelectItem>
                          <SelectItem value="warning">Avisos e superiores</SelectItem>
                          <SelectItem value="error">Apenas erros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>SMS</Label>
                      <Select defaultValue="error">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Todos os níveis</SelectItem>
                          <SelectItem value="warning">Avisos e superiores</SelectItem>
                          <SelectItem value="error">Apenas erros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
