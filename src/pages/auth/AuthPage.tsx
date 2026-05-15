import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, LogIn, UserPlus, Leaf, Shield, BarChart3, Globe } from 'lucide-react';
import { DemoLogin } from '@/components/auth/DemoLogin';
import authBg from '@/assets/auth-bg.jpg';
import { BrandLogo } from '@/components/brand/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a palavra-passe'),
  full_name: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As palavras-passe não coincidem',
  path: ['confirmPassword'],
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loadingDemoAccount, setLoadingDemoAccount] = useState<string | null>(null);

  if (user) {
    navigate('/');
    return null;
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', full_name: '', phone: '' },
  });

  const handleLogin = async (data: LoginValues) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas. Verifique o email e a palavra-passe.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Email não confirmado. Verifique a sua caixa de entrada.');
      } else {
        toast.error('Erro ao iniciar sessão: ' + error.message);
      }
      return;
    }
    toast.success('Sessão iniciada com sucesso!');
    navigate('/');
  };

  const handleSignup = async (data: SignupValues) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, {
      full_name: data.full_name,
      phone: data.phone || '',
    });
    setIsLoading(false);
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Este email já está registado. Tente iniciar sessão.');
      } else {
        toast.error('Erro ao registar: ' + error.message);
      }
      return;
    }
    toast.success('Conta criada com sucesso! Pode agora iniciar sessão.');
    setActiveTab('login');
    loginForm.setValue('email', data.email);
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setLoadingDemoAccount(email);
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    setLoadingDemoAccount(null);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Conta de demonstração não configurada. Contacte o administrador.');
      } else {
        toast.error('Erro ao iniciar sessão: ' + error.message);
      }
      return;
    }
    toast.success('Sessão de demonstração iniciada!');
    navigate('/');
  };

  const features = [
    { icon: Shield, label: 'Segurança institucional com RBAC jurisdicional' },
    { icon: BarChart3, label: 'Analytics e inteligência agro-florestal' },
    { icon: Globe, label: 'Cobertura nacional — 18 províncias' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero image + branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src={authBg}
          alt="Paisagem agrícola angolana"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,45%,12%)/0.85] via-[hsl(152,45%,18%)/0.7] to-[hsl(150,40%,10%)/0.8]" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top — logo */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-white/20 p-2 shadow-lg">
              <BrandLogo variant="mark" className="h-9 w-9" priority />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                SIGAFLO
              </span>
              <span className="block text-white/60 text-[11px] leading-tight tracking-wide uppercase">
                República de Angola
              </span>
            </div>
          </div>

          {/* Center — headline */}
          <div className="max-w-lg">
            <h1
              className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Sistema Integrado de Gestão Agro-Florestal
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Plataforma institucional para a gestão, rastreabilidade e análise dos sectores agropecuário e florestal de Angola.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-4 w-4 text-[hsl(38,92%,55%)]" />
                  </div>
                  <span className="text-white/80 text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — footer */}
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>MINAGRIP</span>
            <span>·</span>
            <span>INCA</span>
            <span>·</span>
            <span>IDF</span>
            <span>·</span>
            <span>INE</span>
            <span>·</span>
            <span>INAMET</span>
          </div>
        </div>
      </div>

      {/* Right panel — auth forms */}
      <div className="flex-1 flex flex-col items-center bg-background p-6 sm:p-10 lg:p-12 overflow-y-auto min-h-screen lg:justify-center">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <BrandLogo variant="horizontal" className="h-12" priority />
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-foreground mb-1"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {activeTab === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'login'
                ? 'Introduza as suas credenciais para aceder à plataforma.'
                : 'Preencha os dados para registar uma nova conta.'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Registar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu.email@exemplo.com" type="email" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palavra-passe</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading}>
                    {isLoading && !loadingDemoAccount ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Entrar na plataforma
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu.email@exemplo.com" type="email" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+244 923 456 789" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Palavra-passe</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••" type="password" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••" type="password" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Criar conta
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">ou acesso rápido</span>
            </div>
          </div>

          <DemoLogin
            onSelectAccount={handleDemoLogin}
            isLoading={isLoading}
            loadingAccount={loadingDemoAccount}
          />

          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} SIGAFLO — Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
