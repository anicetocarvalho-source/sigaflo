import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, LogIn, UserPlus, Leaf } from 'lucide-react';
import { DemoLogin } from '@/components/auth/DemoLogin';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a palavra-passe'),
  full_name: z.string().min(2, 'Nome completo é obrigatório'),
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

  // Redirect if already logged in
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">SIGAFLO</CardTitle>
              <CardDescription>
                Sistema Integrado de Gestão Agro-Florestal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu.email@exemplo.com" type="email" {...field} />
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
                            <Input placeholder="••••••••" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && !loadingDemoAccount ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LogIn className="h-4 w-4 mr-2" />
                      )}
                      Entrar
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} />
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
                            <Input placeholder="seu.email@exemplo.com" type="email" {...field} />
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
                            <Input placeholder="+244 923 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Palavra-passe</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" {...field} />
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
                          <FormLabel>Confirmar Palavra-passe</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Registar
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <DemoLogin 
          onSelectAccount={handleDemoLogin}
          isLoading={isLoading}
          loadingAccount={loadingDemoAccount}
        />
      </div>
    </div>
  );
};

export default AuthPage;
