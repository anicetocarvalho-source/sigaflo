import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Leaf, TreePine, Coffee, Wheat, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", path: "/portal", icon: Leaf },
  { label: "Agricultura", path: "/portal/agricultura", icon: Wheat },
  { label: "Florestas", path: "/portal/florestal", icon: TreePine },
  { label: "Café", path: "/portal/cafe", icon: Coffee },
  { label: "Arroz", path: "/portal/arroz", icon: Wheat },
  { label: "Verificação", path: "/portal/verificar", icon: ShieldCheck },
  { label: "Sobre", path: "/portal/sobre", icon: Info },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/portal") return location.pathname === "/portal";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/portal" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-foreground font-['Outfit']">SIGAFLO</span>
                <span className="text-xs block text-muted-foreground -mt-1">Portal Agroflorestal</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
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
                <SheetContent side="right" className="w-72">
                  <SheetTitle className="flex items-center gap-2 mb-6">
                    <Leaf className="h-5 w-5 text-primary" />
                    SIGAFLO
                  </SheetTitle>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
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
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold font-['Outfit']">SIGAFLO</span>
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
              <span>INE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
