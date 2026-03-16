import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Building2, 
  MapPin, 
  BarChart3, 
  Coffee, 
  TreeDeciduous, 
  Cloud, 
  Eye,
  Users,
  Loader2,
  Settings
} from 'lucide-react';
import { getRoleLabel, UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin.nacional@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'admin_national',
    description: 'Acesso total ao sistema, gestão de utilizadores e configurações',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-red-500/10 text-red-600 border-red-200',
  },
  {
    email: 'admin.provincial@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'admin_provincial',
    description: 'Gestão de dados e utilizadores a nível provincial',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-600 border-orange-200',
  },
  {
    email: 'admin.municipal@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'admin_municipal',
    description: 'Gestão de dados e utilizadores a nível municipal',
    icon: <MapPin className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
  {
    email: 'tecnico.nacional@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'technician_national',
    description: 'Análise estatística e relatórios nacionais',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  {
    email: 'tecnico.provincial@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'technician_provincial',
    description: 'Recolha e validação de dados provinciais',
    icon: <Coffee className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-600 border-green-200',
  },
  {
    email: 'tecnico.municipal@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'technician_municipal',
    description: 'Trabalho de campo e registo de produtores',
    icon: <TreeDeciduous className="h-5 w-5" />,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
  {
    email: 'entidade@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'private_entity',
    description: 'Acesso a dados de exportação e certificados',
    icon: <Cloud className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
  },
  {
    email: 'visualizador@demo.sigaflo.ao',
    password: 'demo123456',
    role: 'viewer',
    description: 'Consulta de dados públicos e relatórios',
    icon: <Eye className="h-5 w-5" />,
    color: 'bg-gray-500/10 text-gray-600 border-gray-200',
  },
];

interface DemoLoginProps {
  onSelectAccount: (email: string, password: string) => void;
  isLoading: boolean;
  loadingAccount: string | null;
}

export const DemoLogin = ({ onSelectAccount, isLoading, loadingAccount }: DemoLoginProps) => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDemoUsers = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-users');
      
      if (error) {
        toast.error('Erro ao configurar contas demo: ' + error.message);
        return;
      }
      
      if (data?.success) {
        const created = data.results.filter((r: any) => r.status === 'created').length;
        const exists = data.results.filter((r: any) => r.status === 'exists').length;
        toast.success(`Contas demo configuradas! ${created} criadas, ${exists} já existiam.`);
      }
    } catch (err) {
      toast.error('Erro ao configurar contas demo');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Contas de demonstração</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSeedDemoUsers}
          disabled={isSeeding}
          className="text-xs h-7 px-2"
        >
          {isSeeding ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Settings className="h-3 w-3 mr-1" />
          )}
          Configurar
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent/50 disabled:opacity-50 ${account.color}`}
            onClick={() => onSelectAccount(account.email, account.password)}
            disabled={isLoading}
          >
            <div className="flex-shrink-0">
              {loadingAccount === account.email ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="[&>svg]:h-4 [&>svg]:w-4">{account.icon}</span>
              )}
            </div>
            <span className="text-xs font-medium truncate">
              {getRoleLabel(account.role)}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Palavra-passe: <code className="bg-muted px-1 rounded text-[10px]">demo123456</code>
      </p>
    </div>
  );
};

export { DEMO_ACCOUNTS };
