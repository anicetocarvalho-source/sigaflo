import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Loader2,
  Save,
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  Wifi,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences, useUpdateUserPreferences } from '@/hooks/useSettings';
import { useProvinces } from '@/hooks/useFarmers';
import { usePaymentGateways, useUpdateGateway } from '@/hooks/usePOS';
import { toast } from 'sonner';

function GatewaySettings() {
  const { data: gateways, isLoading } = usePaymentGateways();
  const updateGateway = useUpdateGateway();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (id: string) => setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));

  const handleToggle = (gw: any, active: boolean) => {
    updateGateway.mutate({ id: gw.id, is_active: active });
  };

  const handleFieldUpdate = (gw: any, field: string, value: string) => {
    const newConfig = { ...(gw.config_data || {}), [field]: value };
    updateGateway.mutate({ id: gw.id, config_data: newConfig });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {gateways?.map((gw: any) => (
        <Card key={gw.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                {gw.display_name}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant={gw.is_sandbox ? 'secondary' : 'default'}>
                  {gw.is_sandbox ? 'Sandbox' : 'Produção'}
                </Badge>
                <Switch checked={gw.is_active} onCheckedChange={(v) => handleToggle(gw, v)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(gw.config_data || {}).map(([key, val]) => {
              const isSecret = key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret');
              return (
                <div key={key} className="flex items-center gap-2">
                  <Label className="w-32 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <div className="flex-1 relative">
                    <Input
                      type={isSecret && !showSecrets[`${gw.id}-${key}`] ? 'password' : 'text'}
                      value={val as string}
                      onChange={e => handleFieldUpdate(gw, key, e.target.value)}
                      className="pr-10"
                    />
                    {isSecret && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleSecret(`${gw.id}-${key}`)}
                      >
                        {showSecrets[`${gw.id}-${key}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => toast.success('Teste de conexão simulado com sucesso')}>
                <Wifi className="h-4 w-4 mr-2" /> Testar Conexão
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { user, profile, roles } = useAuth();
  const { data: preferences, isLoading: prefsLoading } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const { data: provinces } = useProvinces();

  // Local state for form
  const [notifEmail, setNotifEmail] = useState(preferences?.notifications_email ?? true);
  const [notifPush, setNotifPush] = useState(preferences?.notifications_push ?? true);
  const [notifSms, setNotifSms] = useState(preferences?.notifications_sms ?? false);
  const [theme, setTheme] = useState(preferences?.theme ?? 'system');
  const [language, setLanguage] = useState(preferences?.language ?? 'pt');
  const [defaultProvince, setDefaultProvince] = useState(preferences?.default_province_id ?? '');

  // Update local state when preferences load
  useState(() => {
    if (preferences) {
      setNotifEmail(preferences.notifications_email);
      setNotifPush(preferences.notifications_push);
      setNotifSms(preferences.notifications_sms);
      setTheme(preferences.theme);
      setLanguage(preferences.language);
      setDefaultProvince(preferences.default_province_id || '');
    }
  });

  const handleSaveNotifications = () => {
    updatePreferences.mutate({
      notifications_email: notifEmail,
      notifications_push: notifPush,
      notifications_sms: notifSms,
    });
  };

  const handleSaveAppearance = () => {
    updatePreferences.mutate({
      theme: theme as 'light' | 'dark' | 'system',
      language,
    });
    
    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSaveGeneral = () => {
    updatePreferences.mutate({
      default_province_id: defaultProvince || null,
    });
  };

  return (
    <MainLayout title="Configurações" subtitle="Gerir preferências e configurações do sistema">
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="gateway" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Os seus dados de utilizador no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={profile?.full_name || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={profile?.phone || 'Não definido'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input value={profile?.position || 'Não definido'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input value={profile?.department || 'Não definido'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Função no Sistema</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="capitalize">
                        {roles[0]?.replace(/_/g, ' ') || 'viewer'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alterar Palavra-passe</h4>
                    <p className="text-sm text-muted-foreground">
                      Actualize a sua palavra-passe de acesso
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                    Alterar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferências de Notificações
                </CardTitle>
                <CardDescription>
                  Configure como pretende receber notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Notificações por Email</h4>
                        <p className="text-sm text-muted-foreground">
                          Receber alertas e resumos por email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifEmail}
                      onCheckedChange={setNotifEmail}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                        <Monitor className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Notificações Push</h4>
                        <p className="text-sm text-muted-foreground">
                          Notificações em tempo real no navegador
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifPush}
                      onCheckedChange={setNotifPush}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Notificações SMS</h4>
                        <p className="text-sm text-muted-foreground">
                          Alertas críticos via mensagem de texto
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifSms}
                      onCheckedChange={setNotifSms}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={updatePreferences.isPending}>
                    {updatePreferences.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Tema</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Seleccione o tema de cores da interface
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Sun className="h-6 w-6" />
                        <span className="text-sm font-medium">Claro</span>
                        {theme === 'light' && <CheckCircle className="h-4 w-4 text-primary" />}
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Moon className="h-6 w-6" />
                        <span className="text-sm font-medium">Escuro</span>
                        {theme === 'dark' && <CheckCircle className="h-4 w-4 text-primary" />}
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Monitor className="h-6 w-6" />
                        <span className="text-sm font-medium">Sistema</span>
                        {theme === 'system' && <CheckCircle className="h-4 w-4 text-primary" />}
                      </button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Português (Angola)
                          </div>
                        </SelectItem>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            English
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAppearance} disabled={updatePreferences.isPending}>
                    {updatePreferences.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Definições gerais da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Província Padrão</Label>
                    <p className="text-sm text-muted-foreground">
                      Província pré-seleccionada em filtros e formulários
                    </p>
                    <Select value={defaultProvince} onValueChange={setDefaultProvince}>
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Seleccione uma província" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (todas)</SelectItem>
                        {provinces?.map(prov => (
                          <SelectItem key={prov.id} value={prov.id}>
                            {prov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                        <Database className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Dados Locais</h4>
                        <p className="text-sm text-muted-foreground">
                          Limpar cache e dados temporários
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        localStorage.clear();
                        toast.success('Cache limpo com sucesso');
                      }}
                    >
                      Limpar Cache
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Sessões Activas</h4>
                        <p className="text-sm text-muted-foreground">
                          Terminar todas as outras sessões
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                    >
                      Terminar Outras
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={updatePreferences.isPending}>
                    {updatePreferences.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gateway Tab */}
          <TabsContent value="gateway">
            <GatewaySettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
