import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole, getRoleLabel } from '@/contexts/AuthContext';
import { useProvinces, useMunicipalities } from '@/hooks/useFarmers';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Shield, Loader2, UserPlus, Mail, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const ALL_ROLES: UserRole[] = [
  'admin_national',
  'admin_provincial',
  'admin_municipal',
  'technician_national',
  'technician_provincial',
  'technician_municipal',
  'private_entity',
  'viewer',
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin_national: 'bg-red-500',
  admin_provincial: 'bg-orange-500',
  admin_municipal: 'bg-yellow-500',
  technician_national: 'bg-blue-500',
  technician_provincial: 'bg-cyan-500',
  technician_municipal: 'bg-teal-500',
  private_entity: 'bg-purple-500',
  viewer: 'bg-gray-500',
};

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar_url?: string;
  province_id?: string;
  municipality_id?: string;
  is_active: boolean;
  created_at: string;
  provinces?: { name: string };
  municipalities?: { name: string };
  roles: UserRole[];
}

const useUsers = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*, provinces(name), municipalities(name)')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const rolesMap = new Map<string, UserRole[]>();
      allRoles?.forEach((r: any) => {
        const existing = rolesMap.get(r.user_id) || [];
        existing.push(r.role as UserRole);
        rolesMap.set(r.user_id, existing);
      });

      return profiles?.map((p: any) => ({
        ...p,
        roles: rolesMap.get(p.id) || [],
      })) as UserWithRoles[];
    },
  });
};

const assignRoleSchema = z.object({
  user_id: z.string().min(1, 'Selecione um utilizador'),
  role: z.string().min(1, 'Selecione um papel'),
});

const UsersPage = () => {
  const { canManageRole, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useUsers();
  const { data: provinces } = useProvinces();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: { user_id: '', role: '' },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id, role, granted_by: currentUser?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Papel atribuído com sucesso');
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate')) {
        toast.error('Este utilizador já tem este papel atribuído');
      } else {
        toast.error('Erro ao atribuir papel: ' + error.message);
      }
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Papel removido');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover papel: ' + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ user_id, is_active }: { user_id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active })
        .eq('id', user_id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success(variables.is_active ? 'Utilizador ativado' : 'Utilizador desativado');
    },
    onError: (error: any) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const filteredUsers = users?.filter((u) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.position?.toLowerCase().includes(searchLower)
    );
  });

  const availableRoles = ALL_ROLES.filter((role) => canManageRole(role));

  const handleAssignRole = (data: { user_id: string; role: string }) => {
    assignRoleMutation.mutate({ user_id: data.user_id, role: data.role as UserRole });
  };

  return (
    <MainLayout title="Gestão de Utilizadores" subtitle="Administrar utilizadores e papéis do sistema">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar utilizadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Atribuir Papel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Papel a Utilizador</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAssignRole)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utilizador</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o utilizador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name} ({u.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o papel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={assignRoleMutation.isPending}>
                      {assignRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Atribuir
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilizador</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Papéis</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              {user.position && (
                                <p className="text-xs text-muted-foreground">{user.position}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{user.email}</p>
                            {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.provinces?.name && <p>{user.provinces.name}</p>}
                            {user.municipalities?.name && (
                              <p className="text-muted-foreground">{user.municipalities.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  className={`${ROLE_COLORS[role]} text-white text-xs cursor-pointer`}
                                  onClick={() => {
                                    if (canManageRole(role) && user.id !== currentUser?.id) {
                                      removeRoleMutation.mutate({ user_id: user.id, role });
                                    }
                                  }}
                                >
                                  {getRoleLabel(role)}
                                  {canManageRole(role) && user.id !== currentUser?.id && (
                                    <X className="h-3 w-3 ml-1" />
                                  )}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem papéis</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {user.id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleActiveMutation.mutate({
                                    user_id: user.id,
                                    is_active: !user.is_active,
                                  })
                                }
                              >
                                {user.is_active ? 'Desativar' : 'Ativar'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum utilizador encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {filteredUsers && filteredUsers.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {filteredUsers.length} utilizador(es) encontrado(s)
          </p>
        )}
      </div>
    </MainLayout>
  );
};

export default UsersPage;
