import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, Leaf, TreePine, Coffee, Wheat, ShieldCheck, Info, BarChart3, BookOpen, Newspaper, MapPin, HelpCircle, Building2, Users, ChevronDown, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const sectorItems = [
  { label: "Agricultura", path: "/portal/agricultura", icon: Wheat, desc: "Produção agrícola e agricultores" },
  { label: "Florestas", path: "/portal/florestal", icon: TreePine, desc: "Licenciamento e reflorestamento" },
  { label: "Café", path: "/portal/cafe", icon: Coffee, desc: "Cadeia de valor do café" },
  { label: "Arroz", path: "/portal/arroz", icon: Wheat, desc: "Produção e importações" },
];

const infoItems = [
  { label: "Indicadores", path: "/portal/indicadores", icon: BarChart3 },
  { label: "Legislação", path: "/portal/legislacao", icon: BookOpen },
  { label: "Notícias", path: "/portal/noticias", icon: Newspaper },
  { label: "Mapa", path: "/portal/mapa", icon: MapPin },
  { label: "Galeria", path: "/portal/galeria", icon: Images },
  { label: "Registos", path: "/portal/registos", icon: Users },
];

const utilItems = [
  { label: "Verificação", path: "/portal/verificar", icon: ShieldCheck },
  { label: "FAQ", path: "/portal/faq", icon: HelpCircle },
  { label: "Contactos", path: "/portal/contactos", icon: Building2 },
  { label: "Sobre", path: "/portal/sobre", icon: Info },
];

const allMobileItems = [
  { label: "Início", path: "/portal", icon: Leaf },
  ...sectorItems.map(s => ({ label: s.label, path: s.path, icon: s.icon })),
  ...infoItems,
  ...utilItems,
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/portal") return location.pathname === "/portal";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="font-portal min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/portal" className="flex items-center gap-2" aria-label="SIGAFLO — Início">
              <BrandLogo variant="mark" className="h-10 w-10 sm:hidden" priority />
              <BrandLogo variant="horizontal" className="hidden sm:block h-10" priority />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/portal"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive("/portal") && location.pathname === "/portal"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Início
              </Link>

              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent h-auto px-3 py-2">
                      Sectores
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[400px] gap-1 p-3">
                        {sectorItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={cn(
                                "flex items-center gap-3 rounded-md p-3 text-sm transition-colors hover:bg-muted",
                                isActive(item.path) && "bg-muted"
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {infoItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/portal/verificar"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive("/portal/verificar")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Verificação
              </Link>
            </nav>

            {/* Login + Mobile */}
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  Acesso Institucional
                </Button>
              </Link>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 overflow-y-auto">
                  <SheetTitle className="mb-6">
                    <BrandLogo variant="horizontal" className="h-9" />
                    <span className="sr-only">SIGAFLO</span>
                  </SheetTitle>
                  <nav className="flex flex-col gap-1">
                    {allMobileItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive(item.path)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <div className="border-t mt-4 pt-4">
                      <Link to="/auth" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Acesso Institucional
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-3">
                <BrandLogo variant="horizontal" className="h-10" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Sistema Integrado de Gestão Agropecuária e Florestal — Plataforma oficial de informação 
                e gestão dos sectores agrícola e florestal da República de Angola.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Sectores</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/portal/agricultura" className="hover:text-foreground transition-colors">Agricultura</Link></li>
                <li><Link to="/portal/florestal" className="hover:text-foreground transition-colors">Florestas</Link></li>
                <li><Link to="/portal/cafe" className="hover:text-foreground transition-colors">Café</Link></li>
                <li><Link to="/portal/arroz" className="hover:text-foreground transition-colors">Arroz</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Institucional</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/portal/indicadores" className="hover:text-foreground transition-colors">Indicadores</Link></li>
                <li><Link to="/portal/legislacao" className="hover:text-foreground transition-colors">Legislação</Link></li>
                <li><Link to="/portal/verificar" className="hover:text-foreground transition-colors">Verificação de Documentos</Link></li>
                <li><Link to="/portal/sobre" className="hover:text-foreground transition-colors">Sobre o SIGAFLO</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Acesso Institucional</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SIGAFLO — Ministério da Agricultura e Pescas (MINAGRIP). Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>MINAGRIP</span>
              <span>•</span>
              <span>INCA</span>
              <span>•</span>
              <span>IDF</span>
              <span>•</span>
              <span>INCER</span>
              <span>•</span>
              <span>INE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
