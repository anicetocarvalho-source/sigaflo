import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
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
  Monitor,
  MoreVertical,
  Star,
  StarOff,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useNotificationStats,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useToggleNotificationStar,
  useDeleteNotification,
  SystemNotification,
  NotificationCategory,
  NotificationType,
} from '@/hooks/useNotifications';

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
  infrastructure: { label: 'Infraestrutura', icon: Monitor, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

// Type config
const typeConfig: Record<NotificationType, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-blue-500' },
  success: { icon: CheckCircle2, color: 'text-green-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  error: { icon: XCircle, color: 'text-red-500' },
};

const NotificationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch real data
  const { data: notifications, isLoading, refetch } = useNotifications({
    category: selectedCategory !== 'all' ? selectedCategory as NotificationCategory : undefined,
    unreadOnly: activeTab === 'unread' || showUnreadOnly,
  });
  const { data: stats } = useNotificationStats();

  // Mutations
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const toggleStar = useToggleNotificationStar();
  const deleteNotification = useDeleteNotification();

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications.filter(n => {
      if (selectedType !== 'all' && n.notification_type !== selectedType) return false;
      if (activeTab === 'starred' && !n.is_starred) return false;
      return true;
    });
  }, [notifications, selectedType, activeTab]);

  // Actions
  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleToggleStar = (id: string, currentStarred: boolean) => {
    toggleStar.mutate({ id, starred: !currentStarred });
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
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

  const NotificationItem = ({ notification }: { notification: SystemNotification }) => {
    const TypeIcon = typeConfig[notification.notification_type]?.icon || Info;
    const CategoryIcon = categoryConfig[notification.category]?.icon || Bell;
    
    return (
      <div
        className={cn(
          'flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors hover:bg-muted/50',
          !notification.is_read && 'bg-primary/5'
        )}
      >
        <Checkbox
          checked={selectedIds.includes(notification.id)}
          onCheckedChange={() => toggleSelect(notification.id)}
          className="mt-1"
        />
        
        <div className={cn('p-2 rounded-full', categoryConfig[notification.category]?.color || 'bg-muted')}>
          <CategoryIcon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <TypeIcon className={cn('h-4 w-4', typeConfig[notification.notification_type]?.color)} />
                <h4 className={cn('font-medium truncate', !notification.is_read ? 'text-foreground' : 'text-muted-foreground')}>
                  {notification.title}
                </h4>
                {!notification.is_read && (
                  <Badge variant="default" className="h-5 text-xs">Novo</Badge>
                )}
                {notification.is_starred && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  {categoryConfig[notification.category]?.label || notification.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: pt })}
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
                {!notification.is_read && (
                  <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como lida
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleToggleStar(notification.id, notification.is_starred)}>
                  {notification.is_starred ? (
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
                    <Link to={notification.link}>
                      <Bell className="h-4 w-4 mr-2" />
                      Ver detalhes
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(notification.id)}
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
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
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
                <p className="text-2xl font-bold text-primary">{stats?.unread || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.starred || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.today || 0}</p>
                <p className="text-sm text-muted-foreground">Hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              <Info className="h-4 w-4" />
              Não Lidas
              {(stats?.unread || 0) > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{stats?.unread}</Badge>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => refetch()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                      </Button>
                      {(stats?.unread || 0) > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          disabled={markAllAsRead.isPending}
                        >
                          {markAllAsRead.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCheck className="h-4 w-4 mr-2" />
                          )}
                          Marcar todas como lidas
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-4">
                          <Skeleton className="h-5 w-5 rounded" />
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      {filteredNotifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="p-12 text-center">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Receber alertas importantes por email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Alertas de Sistema</Label>
                    <p className="text-sm text-muted-foreground">Notificações sobre manutenção e actualizações</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Resumo Diário</Label>
                    <p className="text-sm text-muted-foreground">Receber um resumo diário das actividades</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
