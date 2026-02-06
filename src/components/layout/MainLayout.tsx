import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';
import { ChatBot } from '@/components/chat/ChatBot';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      ) : (
        <Sidebar />
      )}
      <div className={isMobile ? '' : 'pl-64'}>
        <Header
          title={title}
          subtitle={subtitle}
          onMenuToggle={isMobile ? () => setMobileMenuOpen(true) : undefined}
        />
        <main className={isMobile ? 'p-4' : 'p-6'}>{children}</main>
      </div>
      <ChatBot />
    </div>
  );
}
