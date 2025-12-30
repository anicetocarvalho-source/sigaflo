import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    label: 'Painel Principal',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Agricultores',
    icon: Users,
    children: [
      { label: 'Registo de Agricultores', href: '/agricultores' },
      { label: 'Escolas de Campo', href: '/agricultores/escolas' },
      { label: 'Cooperativas', href: '/agricultores/cooperativas' },
    ],
  },
  {
    label: 'Certificados',
    icon: FileCheck,
    children: [
      { label: 'Emissão de Certificados', href: '/certificados' },
      { label: 'Verificação Pública', href: '/certificados/verificar' },
    ],
  },
  {
    label: 'Ocorrências',
    icon: CloudRain,
    children: [
      { label: 'Climáticas', href: '/ocorrencias/climaticas' },
      { label: 'Fitossanitárias', href: '/ocorrencias/fitossanitarias' },
      { label: 'Alertas', href: '/ocorrencias/alertas' },
    ],
  },
  {
    label: 'Infra-estruturas',
    icon: Building2,
    children: [
      { label: 'Agropecuárias', href: '/infraestruturas' },
      { label: 'Mercados', href: '/infraestruturas/mercados' },
    ],
  },
  {
    label: 'Gestão Florestal',
    icon: TreePine,
    children: [
      { label: 'Licenciamento', href: '/florestal/licenciamento' },
      { label: 'Rastreabilidade', href: '/florestal/rastreabilidade' },
      { label: 'Fiscalização', href: '/florestal/fiscalizacao' },
      { label: 'Reflorestamento', href: '/florestal/reflorestamento' },
      { label: 'Denúncias', href: '/florestal/denuncias' },
    ],
  },
  {
    label: 'Cadeia do Café',
    icon: Coffee,
    children: [
      { label: 'Rastreio por Lote', href: '/cafe/rastreio' },
      { label: 'Semaforização', href: '/cafe/semaforizacao' },
      { label: 'Portal de Verificação', href: '/cafe/verificar' },
    ],
  },
  {
    label: 'Produção de Arroz',
    icon: Wheat,
    children: [
      { label: 'Visão Geral', href: '/arroz' },
      { label: 'Produção Nacional', href: '/arroz/producao' },
      { label: 'Importações', href: '/arroz/importacoes' },
      { label: 'Preços', href: '/arroz/precos' },
      { label: 'Consumo', href: '/arroz/consumo' },
      { label: 'Políticas', href: '/arroz/politicas' },
    ],
  },
];

const secondaryNavigation = [
  { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { label: 'Mapas', href: '/mapas', icon: Map },
  { label: 'Documentação', href: '/documentacao', icon: FileText },
  { label: 'Notificações', href: '/notificacoes', icon: Bell },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Produção de Arroz']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some(child => location.pathname === child.href);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col sidebar-gradient">
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

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map(item => (
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
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Admin Nacional</p>
            <p className="truncate text-xs text-sidebar-foreground/60">MINAGRIF</p>
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
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
