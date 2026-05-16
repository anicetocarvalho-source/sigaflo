import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ForceUpdateButton } from '@/components/layout/ForceUpdateButton';
import { useAuth, getRoleLabel } from '@/contexts/AuthContext';
import { useModulePermissions, checkModuleAccess } from '@/hooks/useModulePermissions';
import type { AppModule } from '@/lib/modules';
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
  ShoppingCart,
  Tractor,
  Activity,
  Satellite,
  ShieldAlert,
} from 'lucide-react';

type UserRole = 'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
  adminOnly?: boolean;
  allowedRoles?: UserRole[];
  module?: AppModule;
}

const TECH_AND_ADMIN: UserRole[] = ['admin_national', 'admin_provincial', 'admin_municipal', 'technician_national', 'technician_provincial', 'technician_municipal'];
const ALL_INTERNAL: UserRole[] = [...TECH_AND_ADMIN, 'private_entity'];
const NATIONAL_ONLY: UserRole[] = ['admin_national', 'technician_national'];
const ADMIN_ONLY: UserRole[] = ['admin_national', 'admin_provincial', 'admin_municipal'];

interface NavSection {
  label: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { label: 'Painel Principal', href: '/', icon: LayoutDashboard },
      { label: 'Notificações', href: '/notificacoes', icon: Bell },
      { label: 'Mapas', href: '/mapas', icon: Map },
    ],
  },
  {
    label: 'Cadastro e Território',
    items: [
      {
        label: 'Agricultores',
        icon: Users,
        allowedRoles: ALL_INTERNAL,
        module: 'farmers',
        children: [
          { label: 'Registo de Agricultores', href: '/agricultores' },
          { label: 'Escolas de Campo', href: '/agricultores/escolas' },
          { label: 'Cooperativas', href: '/agricultores/cooperativas' },
          { label: 'Parcelas', href: '/parcelas' },
          { label: 'Cartões ID', href: '/agricultores/cartoes' },
          { label: 'Cadastro de Campo', href: '/cadastro-campo' },
          { label: 'Acesso Externo', href: '/cadastro-externo' },
        ],
      },
      { label: 'Técnicos de Campo', href: '/tecnicos', icon: UserCog, allowedRoles: TECH_AND_ADMIN, module: 'farmers' },
      {
        label: 'Infra-estruturas',
        icon: Building2,
        allowedRoles: ALL_INTERNAL,
        module: 'farmers',
        children: [
          { label: 'Agropecuárias', href: '/infraestruturas/agropecuarias' },
          { label: 'Mercados', href: '/infraestruturas/mercados' },
        ],
      },
      { label: 'Histórico de Produção', href: '/producao', icon: TrendingUp, allowedRoles: ALL_INTERNAL, module: 'farmers' },
      {
        label: 'Certificados',
        icon: FileCheck,
        allowedRoles: TECH_AND_ADMIN,
        module: 'farmers',
        children: [
          { label: 'Emissão de Certificados', href: '/certificados' },
          { label: 'Verificação Pública', href: '/certificados/verificar' },
        ],
      },
    ],
  },
  {
    label: 'Sectores Produtivos',
    items: [
      {
        label: 'Gestão Florestal',
        icon: TreePine,
        allowedRoles: ALL_INTERNAL,
        module: 'forestry',
        children: [
          { label: 'Inventário Florestal', href: '/florestal/inventario' },
          { label: '↳ Leitor RFID Árvores', href: '/rfid-arvores' },
          { label: 'Licenciamento', href: '/florestal/licenciamento' },
          { label: 'Planos de Maneio (EUDR)', href: '/florestal/planos-maneio' },
          { label: 'Pagamentos AGT', href: '/florestal/pagamentos' },
          { label: 'Certificação Verde', href: '/florestal/certificacao-verde' },
          { label: 'Rastreabilidade', href: '/florestal/rastreabilidade' },
          { label: 'Fiscalização', href: '/florestal/fiscalizacao' },
          { label: 'Reflorestamento', href: '/florestal/reflorestamento' },
          { label: 'Ocorrências', href: '/florestal/ocorrencias' },
          { label: 'Incêndios', href: '/florestal/incendios' },
          { label: 'Pragas e Doenças', href: '/florestal/pragas' },
          { label: 'Denúncias', href: '/florestal/denuncias' },
        ],
      },
      {
        label: 'Cadeia do Café',
        icon: Coffee,
        allowedRoles: ALL_INTERNAL,
        module: 'coffee',
        children: [
          { label: 'Lotes de Café', href: '/cafe/lotes' },
          { label: 'Rastreio por Lote', href: '/cafe/rastreio' },
          { label: 'Semaforização', href: '/cafe/semaforizacao' },
          { label: 'Portal de Verificação', href: '/cafe/verificar' },
        ],
      },
      {
        label: 'Produção de Grãos',
        icon: Wheat,
        allowedRoles: TECH_AND_ADMIN,
        module: 'rice',
        children: [
          { label: 'Visão Geral', href: '/arroz' },
          { label: 'Produção Nacional', href: '/arroz/producao' },
          { label: 'Importações', href: '/arroz/importacoes' },
          { label: 'Preços', href: '/arroz/precos' },
          { label: 'Consumo', href: '/arroz/consumo' },
          { label: 'Políticas', href: '/arroz/politicas' },
        ],
      },
      { label: 'Mecanização Agrícola', href: '/mecanizacao', icon: Tractor, allowedRoles: TECH_AND_ADMIN, module: 'mechanization' },
    ],
  },
  {
    label: 'Comércio e Financeiro',
    items: [
      {
        label: 'Vendas & POS',
        icon: ShoppingCart,
        allowedRoles: TECH_AND_ADMIN,
        module: 'pos',
        children: [
          { label: 'Ponto de Venda', href: '/pos' },
          { label: 'Facturas', href: '/faturas' },
          { label: 'Compras Subsidiadas', href: '/compras' },
          { label: 'Pacotes de Compras', href: '/pacotes-compras' },
        ],
      },
      { label: 'Crédito e Seguro', href: '/credito-seguro', icon: Landmark, allowedRoles: TECH_AND_ADMIN, module: 'credit_insurance' },
      { label: 'Seguros Agrícolas', href: '/seguros', icon: Shield, allowedRoles: TECH_AND_ADMIN, module: 'credit_insurance' },
      {
        label: 'Gestão de Incentivos',
        icon: Gift,
        allowedRoles: ADMIN_ONLY,
        module: 'incentives',
        children: [
          { label: 'Programas e Alocações', href: '/incentivos' },
          { label: 'Analytics e Impacto', href: '/incentivos-analytics' },
        ],
      },
    ],
  },
  {
    label: 'Inteligência e Monitoria',
    items: [
      { label: 'Observatório (ONAF)', href: '/onaf', icon: Eye, allowedRoles: NATIONAL_ONLY, module: 'data_lab' },
      { label: 'Identidade Produtiva', href: '/ipn', icon: Fingerprint, allowedRoles: TECH_AND_ADMIN, module: 'ipn' },
      {
        label: 'Monitoria',
        icon: Activity,
        allowedRoles: TECH_AND_ADMIN,
        module: 'occurrences',
        children: [
          { label: 'Alertas & Riscos', href: '/monitoria/alertas' },
          { label: 'Score Agrícola', href: '/monitoria/score' },
          { label: 'NDVI Satélite', href: '/monitoria/ndvi' },
        ],
      },
      {
        label: 'Risco Climático',
        icon: Umbrella,
        allowedRoles: TECH_AND_ADMIN,
        module: 'climate_risk',
        children: [
          { label: 'Ocorrências e Gestão', href: '/risco-climatico' },
          { label: 'Analytics e Seguro', href: '/risco-climatico-analytics' },
        ],
      },
      {
        label: 'Ocorrências',
        icon: CloudRain,
        allowedRoles: TECH_AND_ADMIN,
        module: 'occurrences',
        children: [
          { label: 'Climáticas', href: '/ocorrencias/climaticas' },
          { label: 'Fitossanitárias', href: '/ocorrencias/fitossanitarias' },
          { label: 'Alertas', href: '/ocorrencias/alertas' },
        ],
      },
      { label: 'Laboratório de Dados', href: '/laboratorio-dados', icon: FlaskConical, allowedRoles: NATIONAL_ONLY, adminOnly: true, module: 'data_lab' },
    ],
  },
  {
    label: 'Administração',
    items: [
      { label: 'Gestão de Utilizadores', href: '/utilizadores', icon: UserCog, allowedRoles: ADMIN_ONLY, adminOnly: true },
      {
        label: 'Companion / NFC',
        icon: Fingerprint,
        allowedRoles: ADMIN_ONLY,
        adminOnly: true,
        children: [
          { label: 'Dispositivos Companion', href: '/admin/companion-devices' },
          { label: 'Cartões NFC', href: '/admin/cartoes-nfc' },
          { label: 'Auditoria de Capturas', href: '/admin/auditoria-capturas' },
        ],
      },
      { label: 'Alertas de Elegibilidade', href: '/admin/alertas-elegibilidade', icon: ShieldAlert, allowedRoles: ADMIN_ONLY, adminOnly: true },
    ],
  },
];

const secondaryNavigation = [
  { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { label: 'Documentação', href: '/documentacao', icon: FileText },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, roles, signOut, isAdmin } = useAuth();
  const modulePerms = useModulePermissions();
  
  const STORAGE_KEY = 'sigaflo:sidebar:expanded';

  // Find which menu should be expanded based on current route
  const getRouteExpanded = (): string[] => {
    for (const section of navigationSections) {
      for (const item of section.items) {
        if (item.children?.some(child => location.pathname.startsWith(child.href))) {
          return [item.label];
        }
      }
    }
    return [];
  };

  const getInitialExpanded = (): string[] => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const merged = new Set<string>(parsed.filter((v): v is string => typeof v === 'string'));
            getRouteExpanded().forEach(l => merged.add(l));
            return Array.from(merged);
          }
        }
      } catch {
        // ignore parse errors
      }
    }
    return getRouteExpanded();
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpanded);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedItems));
    } catch {
      // ignore storage errors (quota / privacy mode)
    }
  }, [expandedItems]);

  // Sync expansion state across browser tabs/windows
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (!Array.isArray(parsed)) return;
        const next = parsed.filter((v): v is string => typeof v === 'string');
        setExpandedItems(prev => {
          if (prev.length === next.length && prev.every((v, i) => v === next[i])) {
            return prev;
          }
          return next;
        });
      } catch {
        // ignore parse errors from other tabs
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some(child => location.pathname.startsWith(child.href));

  const isItemVisible = (item: NavItem) => {
    if (item.allowedRoles) {
      if (!item.allowedRoles.some(role => roles.includes(role))) return false;
    } else if (item.adminOnly) {
      if (!isAdmin) return false;
    }
    if (item.module && !checkModuleAccess(item.module, modulePerms, isAdmin)) {
      return false;
    }
    return true;
  };

  const visibleSections = navigationSections
    .map(section => ({ ...section, items: section.items.filter(isItemVisible) }))
    .filter(section => section.items.length > 0);

  const primaryRole = roles[0];
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col sidebar-gradient">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm">
          <BrandLogo variant="mark" className="h-8 w-8" priority />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-foreground">SIGAFLO</h1>
          <p className="text-[10px] text-sidebar-foreground/70">Gestão Agro-Florestal</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleSections.map((section, idx) => (
          <div key={section.label} className={idx === 0 ? '' : 'mt-4'}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(item => (
                <div key={item.label}>
                  {item.href ? (
                    <Link
                      to={item.href}
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
          </div>
        ))}

        {/* Portal Público */}
        <div className="mt-6 border-t border-sidebar-border pt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Portal Público
          </p>
          <Link
            to="/verificar"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors bg-accent/20 text-sidebar-foreground hover:bg-accent/30"
          >
            <QrCode className="h-5 w-5" />
            <span className="flex-1">Verificação de Documentos</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-4 border-t border-sidebar-border pt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Ferramentas
          </p>
          <div className="space-y-1">
            {secondaryNavigation.map(item => (
              <Link
                key={item.href}
                to={item.href}
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
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {profile?.full_name || 'Utilizador'}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {primaryRole ? getRoleLabel(primaryRole) : 'Sem papel atribuído'}
            </p>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Link
            to="/configuracoes"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
          <button 
            onClick={signOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
        <div className="mt-2">
          <ForceUpdateButton />
        </div>

      </div>
    </aside>
  );
}
