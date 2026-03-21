import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth, getRoleLabel } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CloudRain,
  Building2,
  TreePine,
  Coffee,
  Wheat,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Shield,
  FileText,
  Map,
  BarChart3,
  Bell,
  QrCode,
  ExternalLink,
  TrendingUp,
  UserCog,
  Fingerprint,
  Eye,
  Gift,
  Umbrella,
  FlaskConical,
  Landmark,
} from 'lucide-react';

type UserRole = 'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
  adminOnly?: boolean;
  allowedRoles?: UserRole[];
}

const TECH_AND_ADMIN: UserRole[] = ['admin_national', 'admin_provincial', 'admin_municipal', 'technician_national', 'technician_provincial', 'technician_municipal'];
const ALL_INTERNAL: UserRole[] = [...TECH_AND_ADMIN, 'private_entity'];
const NATIONAL_ONLY: UserRole[] = ['admin_national', 'technician_national'];
const ADMIN_ONLY: UserRole[] = ['admin_national', 'admin_provincial', 'admin_municipal'];

const navigation: NavItem[] = [
  { label: 'Painel Principal', href: '/', icon: LayoutDashboard },
  {
    label: 'Agricultores', icon: Users, allowedRoles: ALL_INTERNAL,
    children: [
      { label: 'Registo de Agricultores', href: '/agricultores' },
      { label: 'Escolas de Campo', href: '/agricultores/escolas' },
      { label: 'Cooperativas', href: '/agricultores/cooperativas' },
    ],
  },
  { label: 'Histórico de Produção', href: '/producao', icon: TrendingUp, allowedRoles: ALL_INTERNAL },
  {
    label: 'Certificados', icon: FileCheck, allowedRoles: TECH_AND_ADMIN,
    children: [
      { label: 'Emissão de Certificados', href: '/certificados' },
      { label: 'Verificação Pública', href: '/certificados/verificar' },
    ],
  },
  {
    label: 'Ocorrências', icon: CloudRain, allowedRoles: TECH_AND_ADMIN,
    children: [
      { label: 'Climáticas', href: '/ocorrencias/climaticas' },
      { label: 'Fitossanitárias', href: '/ocorrencias/fitossanitarias' },
      { label: 'Alertas', href: '/ocorrencias/alertas' },
    ],
  },
  {
    label: 'Infra-estruturas', icon: Building2, allowedRoles: ALL_INTERNAL,
    children: [
      { label: 'Agropecuárias', href: '/infraestruturas/agropecuarias' },
      { label: 'Mercados', href: '/infraestruturas/mercados' },
    ],
  },
  {
    label: 'Gestão Florestal', icon: TreePine, allowedRoles: ALL_INTERNAL,
    children: [
      { label: 'Inventário Florestal', href: '/florestal/inventario' },
      { label: 'Licenciamento', href: '/florestal/licenciamento' },
      { label: 'Rastreabilidade', href: '/florestal/rastreabilidade' },
      { label: 'Fiscalização', href: '/florestal/fiscalizacao' },
      { label: 'Reflorestamento', href: '/florestal/reflorestamento' },
      { label: 'Denúncias', href: '/florestal/denuncias' },
    ],
  },
  {
    label: 'Cadeia do Café', icon: Coffee, allowedRoles: ALL_INTERNAL,
    children: [
      { label: 'Lotes de Café', href: '/cafe/lotes' },
      { label: 'Rastreio por Lote', href: '/cafe/rastreio' },
      { label: 'Semaforização', href: '/cafe/semaforizacao' },
      { label: 'Portal de Verificação', href: '/cafe/verificar' },
    ],
  },
  {
    label: 'Produção de Arroz', icon: Wheat, allowedRoles: TECH_AND_ADMIN,
    children: [
      { label: 'Visão Geral', href: '/arroz' },
      { label: 'Produção Nacional', href: '/arroz/producao' },
      { label: 'Importações', href: '/arroz/importacoes' },
      { label: 'Preços', href: '/arroz/precos' },
      { label: 'Consumo', href: '/arroz/consumo' },
      { label: 'Políticas', href: '/arroz/politicas' },
    ],
  },
  { label: 'Observatório (ONAF)', href: '/onaf', icon: Eye, allowedRoles: NATIONAL_ONLY },
  { label: 'Identidade Produtiva', href: '/ipn', icon: Fingerprint, allowedRoles: TECH_AND_ADMIN },
  {
    label: 'Gestão de Incentivos', icon: Gift, allowedRoles: ADMIN_ONLY,
    children: [
      { label: 'Programas e Alocações', href: '/incentivos' },
      { label: 'Analytics e Impacto', href: '/incentivos-analytics' },
    ],
  },
  {
    label: 'Risco Climático', icon: Umbrella, allowedRoles: TECH_AND_ADMIN,
    children: [
      { label: 'Ocorrências e Gestão', href: '/risco-climatico' },
      { label: 'Analytics e Seguro', href: '/risco-climatico-analytics' },
    ],
  },
  { label: 'Crédito e Seguro', href: '/credito-seguro', icon: Landmark, allowedRoles: TECH_AND_ADMIN },
  { label: 'Laboratório de Dados', href: '/laboratorio-dados', icon: FlaskConical, allowedRoles: NATIONAL_ONLY, adminOnly: true },
  { label: 'Gestão de Utilizadores', href: '/utilizadores', icon: UserCog, allowedRoles: ADMIN_ONLY, adminOnly: true },
];

const secondaryNavigation = [
  { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { label: 'Mapas', href: '/mapas', icon: Map },
  { label: 'Documentação', href: '/documentacao', icon: FileText },
  { label: 'Notificações', href: '/notificacoes', icon: Bell },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const location = useLocation();
  const { profile, roles, signOut, isAdmin } = useAuth();

  const getInitialExpanded = () => {
    for (const item of navigation) {
      if (item.children?.some(child => location.pathname.startsWith(child.href))) {
        return [item.label];
      }
    }
    return [];
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpanded);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some(child => location.pathname.startsWith(child.href));

  const visibleNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  const primaryRole = roles[0];
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleNavigate = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 sidebar-gradient border-r-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-foreground">SIGAFLO</h1>
            <p className="text-[10px] text-sidebar-foreground/70">Gestão Agro-Florestal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 max-h-[calc(100vh-16rem)]">
          <div className="space-y-1">
            {visibleNavigation.map(item => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    to={item.href}
                    onClick={handleNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isChildActive(item.children)
                          ? 'bg-sidebar-accent text-sidebar-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {expandedItems.includes(item.label) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedItems.includes(item.label) && item.children && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            to={child.href}
                            onClick={handleNavigate}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm transition-colors',
                              isActive(child.href)
                                ? 'bg-sidebar-primary/80 text-sidebar-primary-foreground'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Portal Público */}
          <div className="mt-6 border-t border-sidebar-border pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Portal Público
            </p>
            <Link
              to="/verificar"
              onClick={handleNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors bg-accent/20 text-sidebar-foreground hover:bg-accent/30"
            >
              <QrCode className="h-5 w-5" />
              <span className="flex-1">Verificação</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>

          {/* Secondary */}
          <div className="mt-4 border-t border-sidebar-border pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Ferramentas
            </p>
            <div className="space-y-1">
              {secondaryNavigation.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3 sidebar-gradient">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {profile?.full_name || 'Utilizador'}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {primaryRole ? getRoleLabel(primaryRole) : 'Sem papel'}
              </p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Link
              to="/configuracoes"
              onClick={handleNavigate}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
            <button
              onClick={() => { signOut(); onOpenChange(false); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
