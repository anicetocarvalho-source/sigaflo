import { Search, HelpCircle, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search — hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="w-64 pl-9 bg-muted/50 border-0 focus:bg-background"
          />
        </div>

        <NotificationBell />

        <Button variant="ghost" size="icon" className="hidden md:inline-flex">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" className="hidden md:inline-flex">
          <Globe className="h-5 w-5 text-muted-foreground" />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
