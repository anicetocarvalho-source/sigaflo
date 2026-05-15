import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Shield, Building2, MapPin, BarChart3, Coffee, TreeDeciduous, Cloud, Eye,
  Loader2, Settings, Users, Wheat, ShoppingCart, Tractor, Landmark, Gift,
  Umbrella, Fingerprint, FlaskConical, CloudRain, ChevronDown, ChevronRight,
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

const PASSWORD = 'demo123456';

const GLOBAL_ACCOUNTS: DemoAccount[] = [
  { email: 'admin.nacional@demo.sigaflo.ao',     password: PASSWORD, role: 'admin_national',         description: 'Acesso total', icon: <Shield className="h-5 w-5" />, color: 'bg-red-500/10 text-red-600 border-red-200' },
  { email: 'admin.provincial@demo.sigaflo.ao',   password: PASSWORD, role: 'admin_provincial',       description: 'Provincial',   icon: <Building2 className="h-5 w-5" />, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  { email: 'admin.municipal@demo.sigaflo.ao',    password: PASSWORD, role: 'admin_municipal',        description: 'Municipal',    icon: <MapPin className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  { email: 'tecnico.nacional@demo.sigaflo.ao',   password: PASSWORD, role: 'technician_national',    description: 'Estatística',  icon: <BarChart3 className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { email: 'tecnico.provincial@demo.sigaflo.ao', password: PASSWORD, role: 'technician_provincial',  description: 'Provincial',   icon: <Coffee className="h-5 w-5" />, color: 'bg-green-500/10 text-green-600 border-green-200' },
  { email: 'tecnico.municipal@demo.sigaflo.ao',  password: PASSWORD, role: 'technician_municipal',   description: 'Municipal',    icon: <TreeDeciduous className="h-5 w-5" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { email: 'entidade@demo.sigaflo.ao',           password: PASSWORD, role: 'private_entity',         description: 'Privada',      icon: <Cloud className="h-5 w-5" />, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { email: 'visualizador@demo.sigaflo.ao',       password: PASSWORD, role: 'viewer',                 description: 'Consulta',     icon: <Eye className="h-5 w-5" />, color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
];

interface ModuleAccount {
  slug: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const MODULE_ACCOUNTS: ModuleAccount[] = [
  { slug: 'cadastro',        label: 'Cadastro de Produtores', icon: <Users className="h-4 w-4" />,         color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  { slug: 'florestal',       label: 'Gestão Florestal',       icon: <TreeDeciduous className="h-4 w-4" />, color: 'bg-green-700/10 text-green-800 border-green-300' },
  { slug: 'cafe',            label: 'Cadeia do Café',         icon: <Coffee className="h-4 w-4" />,        color: 'bg-amber-700/10 text-amber-800 border-amber-300' },
  { slug: 'arroz',           label: 'Produção de Arroz',      icon: <Wheat className="h-4 w-4" />,         color: 'bg-yellow-600/10 text-yellow-700 border-yellow-200' },
  { slug: 'pos',             label: 'Vendas & POS',           icon: <ShoppingCart className="h-4 w-4" />,  color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  { slug: 'mecanizacao',     label: 'Mecanização',            icon: <Tractor className="h-4 w-4" />,       color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  { slug: 'credito',         label: 'Crédito & Seguros',      icon: <Landmark className="h-4 w-4" />,      color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
  { slug: 'incentivos',      label: 'Incentivos',             icon: <Gift className="h-4 w-4" />,          color: 'bg-pink-500/10 text-pink-700 border-pink-200' },
  { slug: 'risco-climatico', label: 'Risco Climático',        icon: <Umbrella className="h-4 w-4" />,      color: 'bg-sky-500/10 text-sky-700 border-sky-200' },
  { slug: 'ipn',             label: 'Identidade Produtiva',   icon: <Fingerprint className="h-4 w-4" />,   color: 'bg-violet-500/10 text-violet-700 border-violet-200' },
  { slug: 'datalab',         label: 'Laboratório de Dados',   icon: <FlaskConical className="h-4 w-4" />,  color: 'bg-cyan-500/10 text-cyan-700 border-cyan-200' },
  { slug: 'ocorrencias',     label: 'Ocorrências',            icon: <CloudRain className="h-4 w-4" />,     color: 'bg-rose-500/10 text-rose-700 border-rose-200' },
];

interface DemoLoginProps {
  onSelectAccount: (email: string, password: string) => void;
  isLoading: boolean;
  loadingAccount: string | null;
}

export const DemoLogin = ({ onSelectAccount, isLoading, loadingAccount }: DemoLoginProps) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [showModules, setShowModules] = useState(false);

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
    } catch {
      toast.error('Erro ao configurar contas demo');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Contas de demonstração</p>
        <Button variant="ghost" size="sm" onClick={handleSeedDemoUsers} disabled={isSeeding} className="text-xs h-7 px-2">
          {isSeeding ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Settings className="h-3 w-3 mr-1" />}
          Configurar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {GLOBAL_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent/50 disabled:opacity-50 ${account.color}`}
            onClick={() => onSelectAccount(account.email, account.password)}
            disabled={isLoading}
          >
            <div className="flex-shrink-0">
              {loadingAccount === account.email
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <span className="[&>svg]:h-4 [&>svg]:w-4">{account.icon}</span>}
            </div>
            <span className="text-xs font-medium truncate">{getRoleLabel(account.role)}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowModules(s => !s)}
        className="flex w-full items-center justify-between rounded-md border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/30"
      >
        <span>Contas restritas por módulo (24)</span>
        {showModules ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {showModules && (
        <div className="space-y-2">
          {MODULE_ACCOUNTS.map((m) => {
            const nacEmail = `${m.slug}.nacional@demo.sigaflo.ao`;
            const provEmail = `${m.slug}.provincial@demo.sigaflo.ao`;
            return (
              <div key={m.slug} className="rounded-lg border p-2">
                <div className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold ${m.color.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                  {m.icon}
                  <span className="truncate">{m.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] transition-colors hover:bg-accent/50 disabled:opacity-50 ${m.color}`}
                    onClick={() => onSelectAccount(nacEmail, PASSWORD)}
                    disabled={isLoading}
                  >
                    {loadingAccount === nacEmail
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <BarChart3 className="h-3 w-3" />}
                    <span className="truncate">Nacional</span>
                  </button>
                  <button
                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] transition-colors hover:bg-accent/50 disabled:opacity-50 ${m.color}`}
                    onClick={() => onSelectAccount(provEmail, PASSWORD)}
                    disabled={isLoading}
                  >
                    {loadingAccount === provEmail
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Building2 className="h-3 w-3" />}
                    <span className="truncate">Provincial</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Palavra-passe: <code className="bg-muted px-1 rounded text-[10px]">{PASSWORD}</code>
      </p>
    </div>
  );
};

export const DEMO_ACCOUNTS = GLOBAL_ACCOUNTS;
